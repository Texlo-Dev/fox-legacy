import { Event, FoxClient, CustomCommand } from "../util";
import { FoxMessage } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "unknownCommand",
            description: "Fires when an unknown command is run."
        });
    }

    public async run(message: FoxMessage) {
        if (message.guild) {
            const commandPrefix = message.guild ? message.guild.config.prefix : this.client.commandPrefix;
            const prefix = new RegExp(`^<@!?${this.client.user.id}> |^${this.regExpEsc(commandPrefix)}`).exec(message.content);
            if (!prefix) return;
            const args = message.content.slice(prefix[0].length).trim().split(/ +/g);
            const cmdName = args.shift().toLowerCase();
            if (message.guild.commands.get(cmdName)) return this.handleCustomCommand(message, message.guild.commands.get(cmdName), args);
            if (message.guild.config.tacMode) {
                const tag = await this.client.mongo.tags.findOne({
                    tagName: args[0],
                    guildID: message.guild.id
                });
                if (tag) {
                    message.delete().catch(() => 0);
                    tag.increment("usage_count");
                    return message.send(tag.get("tagContent"));
                }
            }
        }
    }

    public regExpEsc(str: string) {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    public async handleCustomCommand(message: FoxMessage, command: CustomCommand, args: string[]) {
        if (!message.guild.packages.get("Custom Commands").enabled) return message.error("The **Custom Commands** Package is currently disabled, please enable it before continuing.");
        if (!command.hasPermission(message)) return message.error(`_**Sorry, but you do not have permission to use this command.**_`);
        if (!command.enabled) return message.error("This command has been disabled by the server administrator.");

        if (!this.client.commands.cooldowns.has(command.name)) this.client.commands.cooldowns.set(command.name, new (require("discord.js")).Collection());
        const now = Date.now();
        const timestamps = this.client.commands.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 0) * 1000;

        if (!timestamps.has(message.author.id)) {
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.error(`You must wait ${require("moment").duration(timeLeft, "seconds").format("h [hours], m [minutes and] s [seconds]")} before using this command again.`);
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }
        return await command.execute(message, args).catch(err => message.error(` There was an error when attempting to execute this custom command: ${err.message}`));
    }

}

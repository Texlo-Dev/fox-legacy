import { Collection } from "discord.js";
import { CustomCommand, Event, FoxClient } from "../util";
import { FoxMessage } from "../util/extensions";
import { Tags } from "../util/Mongo";

export default class UnknownCommand extends Event {

    public static regExpEsc(str: string): string {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "unknownCommand",
            description: "Fires when an unknown command is run.",
        });
    }

    public async handleCustomCommand(message: FoxMessage, command: CustomCommand, args: string[]): Promise<any> {
        if (!message.guild.packages.get("Custom Commands").enabled) {
            return message.error(
                "The **Custom Commands** Package is currently disabled, please enable it before continuing."
            );
        }
        if (!command.hasPermission(message)) {
            return message.error("_**Sorry, but you do not have permission to use this command.**_");
        }
        if (!command.enabled) {
            return message.error("This command has been disabled by the server administrator.");
        }

        if (!this.client.commands.cooldowns.has(command.name)) {
            this.client.commands.cooldowns.set(command.name, new Collection());
        }
        const now: number = Date.now();
        const timestamps: Collection<string, number> = this.client.commands.cooldowns.get(command.name);
        const cooldownAmount: number = (command.cooldown || 0) * 1000;

        if (!timestamps.has(message.author.id)) {
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            const expirationTime: number = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft: number = (expirationTime - now) / 1000;

                return message.error(`You must wait ${require("moment").duration(timeLeft, "seconds").format("h [hours], m [minutes and] s [seconds]")} before using this command again.`); // tslint:disable-line
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }

        return command.execute(message)
            .catch(err => message.error(
                `There was an error when attempting to execute this custom command: ${err.message}
            `));
    }

    public async run(message: FoxMessage): Promise<any> {
        if (message.guild) {
            const commandPrefix: string = message.guild ? message.guild.config.prefix : this.client.commandPrefix;
            const prefix: RegExpExecArray = new RegExp(`^<@!?${this.client.user.id}> |^${UnknownCommand.regExpEsc(commandPrefix)}`).exec(message.content); // tslint:disable-line
            if (!prefix) { return; }
            const args: string[] = message.content.slice(prefix[0].length)
                .trim()
                .split(/ +/g);
            const cmdName: string = args.shift()
                .toLowerCase();
            if (message.guild.commands.get(cmdName)) {
                return this.handleCustomCommand(message, message.guild.commands.get(cmdName), args);
            }
            if (message.guild.config.tacMode) {
                const tag: Tags = await this.client.mongo.tags.findOne({
                    tagName: args[0],
                    guildID: message.guild.id,
                });
                if (tag) {
                    message.delete()
                        .catch(() => 0);
                    tag.increment("usage_count");

                    return message.send(tag.get("tagContent"));
                }
            }
        }
    }

}

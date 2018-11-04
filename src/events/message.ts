import { Event, FoxClient } from "../util";
import { invProtect, spamProtect, massProtect, badWords } from "../util/core/Automod";
import { FoxMessage, FoxUser } from "../util/extensions";
import { TextChannel } from "discord.js";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "message",
            description: "Fires when a message is sent in a server."
        });
    }

    public async run(message: FoxMessage) {
        if (message.author.bot) return;
        if (message.guild && !(message.channel as TextChannel).permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
        if (message.guild) await this.pkgInitialize(message);
        const commandPrefix = message.guild ? message.guild.config.prefix : this.client.commandPrefix;
        const prefix = new RegExp(`^<@!?${this.client.user.id}> |^${this.regExpEsc(commandPrefix || "f)")}`).exec(message.content);
        if (!prefix) return;
        const args = message.content.slice(prefix[0].length).trim().split(/ +/g);
        const command = this.client.commands.get(args.shift().toLowerCase());
        if (!command) return this.client.emit("unknownCommand", message);
        message._registerCommand(command);

        const user = message.author as FoxUser;
        if (!user.upvoter) await user._setUpvoter();
        if (typeof user.patreonTier !== "number") await user._setTier();
        if (command.guildOnly && !message.guild) return message.send("Sorry, this command can only be ran in a guild channel.");
        if (message.guild.config.disabledCommands ? message.guild.config.disabledCommands.indexOf(command.name) > -1 : null) return message.error(" This command has been disabled by the server administrator.");
        // if (!message.guild.packages.get(command.category).enabled) return message.error(` The **${this.client.capitalizeStr(command.category)}** package is currently disabled. Enable it with the enablepkg command.`);
        if (typeof command.hasPermission === "function" && !command.hasPermission(message)) return message.error(" _**Sorry, but you do not have permission to use this command.**_");
        this.client.commandsRun++;

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

        try {
            command._registerExecutor(message);
            if (command.category === "Moderation" && message.guild.config.delModCmds) message.delete().catch(() => 0);
            await command.run(message, args, commandPrefix);
        } catch (error) {
            this.client.emit("commandError", message, error);
        }
    }

    public async pkgInitialize(message: FoxMessage): Promise<void> {
        message.guild.leveling.listen(message);
        message.guild.banking.listen(message);
        try {
            badWords(message);
            await invProtect(message);
            await massProtect(message);
            await spamProtect(message);
        } catch (error) {
            console.error(error);
        }
    }

    public regExpEsc(str: string) {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

}

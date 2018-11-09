// tslint:disable:no-magic-numbers
import { Collection, TextChannel } from "discord.js";
import { Command, Event, FoxClient } from "../util";
import { badWords, invProtect, massProtect, spamProtect } from "../util/core/Automod";
import { FoxMessage, FoxUser } from "../util/extensions";

export default class MessageEvent extends Event {

    public static async pkgInitialize(message: FoxMessage): Promise<void> {
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

    public static regExpEsc(str: string): string {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "message",
            description: "Fires when a message is sent in a server.",
        });
    }

    public async run(message: FoxMessage): Promise<void | boolean | FoxMessage | FoxMessage[]> {
        if (message.author.bot) { return; }
        if (message.guild && !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) { return; }
        if (message.guild) { await MessageEvent.pkgInitialize(message); }
        const commandPrefix: string = message.guild ? message.guild.config.prefix : this.client.commandPrefix;
        const prefix: RegExpExecArray = new RegExp(`^<@!?${this.client.user.id}> |^${MessageEvent.regExpEsc(commandPrefix || "f)")}`).exec(message.content); // tslint:disable-line
        if (!prefix) { return; }
        const args: string[] = message.content.slice(prefix[0].length)
            .trim()
            .split(/ +/g);
        const command: Command = this.client.commands.get(args.shift().toLowerCase());
        if (!command) { return this.client.emit("unknownCommand", message); }
        message._registerCommand(command);

        const user: FoxUser = message.author;
        if (!user.upvoter) { await user._setUpvoter(); }
        if (typeof user.patreonTier !== "number") { await user._setTier(); }
        if (command.guildOnly && !message.guild) {
            return message.send("Sorry, this command can only be ran in a guild channel.");
        }
        if (
            message.guild.config.disabledCommands
            ? message.guild.config.disabledCommands.indexOf(command.name) > -1
            : undefined
        ) { return message.error(" This command has been disabled by the server administrator."); }
        if (!message.guild.packages.get(command.category).enabled) return message.error(`The **${this.client.capitalizeStr(command.category)}** package is currently disabled.`); // tslint:disable-line
        if (typeof command.hasPermission === "function" && !command.hasPermission(message)) {
            return message.error(" _**Sorry, but you do not have permission to use this command.**_");
        } else if (typeof command.constructor.run === "function" && !command.constructor.hasPermission(message)) {
            return message.error(" _**Sorry, but you do not have permission to use this command.**_")
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

        try {
            this.client.commandsRun++;
            command._registerExecutor(message);
            if (command.category === "Moderation" && message.guild.config.delModCmds) {
                message.delete()
                    .catch(() => 0);
            }
            // @ts-ignore
            if (command.constructor.run) return command.constructor.run(message, args, prefix);
            else return command.run(message, args, commandPrefix);
        } catch (error) {
            this.client.emit("commandError", message, error);
        }
    }

}

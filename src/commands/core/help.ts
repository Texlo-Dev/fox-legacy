//tslint:disable
import { Collection, MessageEmbed } from "discord.js";
import { Command, CustomCommand, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static checkPackages(message: FoxMessage): string[] {
        return message.guild.packages.filter(p => p.enabled)
            .map(p => p.name);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "help",
            description: "Shows all the available commands.",
            usage: "[command]",
            aliases: ["commands"],
        });
    }

    public async run(message: FoxMessage, args: string[], prefix: string): Promise<void> {
        const epkgs: string[] = FoxCommand.checkPackages(message);
        if (!args[0]) {
            let myCommands: Collection<string, Command>;
            const res: number = (await this.client.shard.broadcastEval("this.guilds.size"))
                .reduce((prev, val) => prev + val, 0);
            if (message.guild) {
                const filtered: Collection<string, Command> = this.client.commands
                    .filter(c => c.category === "Core" ? true : epkgs.indexOf(c.category) > -1);
                myCommands = filtered.filter(c => c.hasPermission(message) || c.constructor.hasPermission(message))
                    .filter(able =>
                        message.guild.config.disabledCommands
                        ? message.guild.config.disabledCommands.indexOf(able.name) < 0
                        : true,
                    );
                for (const c of message.guild.commands.values()) {
                    if (!c.hasPermission(message)) { continue; }
                    if (!c.enabled) { continue; }
                    myCommands.set(c.name, c);
                }
            } else { myCommands = this.client.commands.filter(c => !c.guildOnly); }
            if (!myCommands.size) {
                return message.error(
                    `No commands are enabled :sadpoop:\nEnable some packages with
                    \`${message.guild ? await message.guild.config.prefix : this.client.commandPrefix}enablepackage\`
                    to get started.
                `);
            }
            let output = `
                Welcome to ${this.client.user.username}, an easy-to-use, multipurpose Discord bot!
                I am currently serving **${res.toLocaleString()}** servers!
                My current command format for
                 ${message.guild ? `the server **${message.guild.name}**` : "this DM"} is \`${prefix}<commandname>\`.
                If you'd like to learn more about one of my commands, just type \`${prefix}help <commandname>\`.

                [Add me to your server!](https://mrfoxbot.xyz/servers) | [Offical ${this.client.user.username} server](https://discord.gg/DfsqmaV) | [Support us on Patreon!](https://www.patreon.com/user?u=7413177)
                `; 
            const categories: object = Array.from(myCommands.keys())
                .reduce((prev, key) => {
                    const command: Command = myCommands.get(key);
                    if (!prev[command.category]) {
                        prev[command.category] = [command.name];
                    } else {
                        prev[command.category].push(command.name);
                    }

                    return prev;
            },          {});

            const mess: string = Object.keys(categories)
                .reduce((prev, key) => prev += `**${key}:**\n${categories[key].join(", ")}\n\n`, ""); //tslint:disable-line
            output += mess;
            const embed: MessageEmbed = new MessageEmbed()
                .setDescription(output)
                .setColor(this.client.brandColor)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL());
            message.send({ embed })
                .catch(() => 0);
        } else {
            const command: Command | CustomCommand = this.client.commands
                .get(args[0]) || message.guild.commands.get(args[0]);
            if (command) {
                let usage: string = command.name;
                if (command.usage) { usage = `${command.name} ${command.usage}`; }
                const embed: MessageEmbed = new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                    .setColor(this.client.brandColor)
                    .setDescription(`
                        Command: **${command.name}**
                        ${command.description}

                        **Usage:** ${prefix}${usage}
                        ${command.extendedUsage
                            ? `\n**Parameters:** \n
                            ${Object.keys(command.extendedUsage)
                                .map(o => `*${o}:* ${command.extendedUsage[o]}`)
                                .join("\n    ")}`
                            : "".trim()}
                        **Category:** ${this.client.capitalizeStr(command.category)}
                        **Required Permission(s):** ${
                            command.requiredPerms && command.requiredPerms.length
                            ? command.requiredPerms
                            : "None"
                        }

                        <> indicates required arguments.
                        [] indicate optional arguments.
                        | separates multiple options.
                    `);
                message.send({ embed });
            }
        }
    }
}

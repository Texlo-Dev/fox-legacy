import { MessageEmbed } from "discord.js";

import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "help",
            description: "Shows all the available commands.",
            usage: "[command]",
            aliases: ["commands"]
        });
    }

    public async run(message, args, prefix) {
        const epkgs = this.checkPackages(message);
        if (!args[0]) {
            let myCommands;
            const res = (await this.client.shard.broadcastEval(`this.guilds.size`)).reduce((prev, val) => prev + val, 0);
            if (message.guild) {
                const filtered = this.client.commands.filter(c => c.category === "Core" ? true : epkgs.indexOf(c.category) > -1);
                myCommands = filtered.filter(c => c.hasPermission(message))
                    .filter(able => message.guild.config.disabledCommands ? message.guild.config.disabledCommands.indexOf(able.name) < 0 : true);
                for (const c of message.guild.commands.values()) {
                    if (!c.hasPermission(message)) continue;
                    if (!c.enabled) continue;
                    myCommands.set(c.name, c);
                }
            } else { myCommands = this.client.commands.filter(c => !c.guildOnly); }
            if (!myCommands.size) return message.error(`No commands are enabled :sadpoop:\nEnable some packages with \`${message.guild ? await message.guild.config.prefix : this.client.commandPrefix}enablepackage\`to get started.`);
            let output = `Welcome to ${this.client.user.username}, an easy-to-use, multipurpose Discord bot!\nI am currently serving **${res.toLocaleString()}** servers!\nMy current command format for ${message.guild ? `the server **${message.guild.name}**` : "this DM"} is \`${prefix}<commandname>\`.\nIf you'd like to learn more about one of my commands, just type \`${prefix}help <commandname>\`.\n[Add me to your server!](https://mrfoxbot.xyz/servers) | [Offical ${this.client.user.username} server](https://discord.gg/DfsqmaV) | [Support us on Patreon!](https://www.patreon.com/user?u=7413177)\n\n`;
            const categories = Array.from(myCommands.keys()).reduce((prev, key) => {
                const command = myCommands.get(key);
                if (!prev[command.category]) prev[command.category] = [command.name];
                else prev[command.category].push(command.name);
                return prev;
            }, {});

            const mess = Object.keys(categories).reduce((prev, key) => prev += `**${key}:**\n${categories[key].join(", ")}\n\n`, ""); // eslint-disable-line
            output += mess;
            const embed = new MessageEmbed()
                .setDescription(output)
                .setColor(this.client.brandColor)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL());
            message.send({ embed }).catch(() => 0);
        } else {
            const command = this.client.commands.get(args[0]) || message.guild.commands.get(args[0]);
            if (command) {
                let usage = command.name;
                if (command.usage) usage = `${command.name} ${command.usage}`;
                const embed = new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                    .setColor(3512625)
                    .setColor(this.client.brandColor)
                    .setDescription(`
                        Command: **${command.name}**
                        ${command.description}

                        **Usage:** ${prefix}${usage}${command.extendedUsage ? `\n**Parameters:** \n    ${Object.keys(command.extendedUsage).map(o => `*${o}:* ${command.extendedUsage[o]}`).join("\n    ")}` : "".trim()}

                        **Category:** ${this.client.capitalizeStr(command.category)}
                        **Required Permission(s):** ${command.requiredPerms && command.requiredPerms.length ? command.requiredPerms : "None"}

                        <> indicates required arguments.
                        [] indicate optional arguments.
                        | separates multiple options.
                    `);
                message.send({ embed });
            }
        }
    }
    public checkPackages(message) {
        return message.guild.packages.filter(p => p.enabled).map(p => p.name);
    }

}

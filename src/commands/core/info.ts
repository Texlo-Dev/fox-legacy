import { version } from "../../config.json";
import { version as discordVersion, MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "info",
            description: "Shows some useful info about the bot.",
            aliases: ["about", "invite"]
        });
    }

    public async run(message) {
        const embed = new MessageEmbed()
            .setAuthor(`${this.client.user.username} Information`, this.client.user.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
            .addField("Shard#", this.client.shard.id, true)
            .addField("Version", `${version}`, true)
            .addField("Lead Developer", this.client.users.get("288855795951599617").tag, true)
            .addField("Servers", `${this.client.guilds.size.toLocaleString()}`, true)
            .addField("Users", `${this.client.users.size.toLocaleString()}`, true)
            .addField("Discord.js version", `v${discordVersion}`, true)
            .addField(`Website`, "https://mrfoxbot.xyz/servers", true)
            .addField(`Official server for ${this.client.user.username}:`, "https://discord.gg/DfsqmaV", true)
            .addField(`Core Developers:`, `${(await this.client.users.fetch("358465137516216341")).tag}\n${(await this.client.users.fetch("272689325521502208")).tag}\n${(await this.client.users.fetch("209031139791339520")).tag}\n${(await this.client.users.fetch("131857875973701633")).tag}`);
        message.send({ embed });
    }

}

import { MessageEmbed, version as discordVersion } from "discord.js";
import { version } from "../../config.json";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions/index.js";

export default class FoxCommand extends Command {
  public constructor(client: FoxClient) {
    super(client, {
      name: "info",
      description: "Shows some useful info about the bot.",
      aliases: ["about", "invite"]
    });
  }

  public async run(message: FoxMessage): Promise<void> {
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        `${this.client.user.username} Information`,
        this.client.user.displayAvatarURL()
      )
      .setColor(this.client.brandColor)
      .setTimestamp()
      .setFooter(`Requested by ${message.author.tag}`)
      .addField("Shard#", this.client.shard.id, true)
      .addField("Version", `${version}`, true)
      .addField(
        "Lead Developer",
        this.client.users.get("288855795951599617").tag,
        true
      )
      .addField("Servers", `${this.client.guilds.size.toLocaleString()}`, true)
      .addField("Users", `${this.client.users.size.toLocaleString()}`, true)
      .addField("Discord.js version", `v${discordVersion}`, true)
      .addField("Website", "https://mrfoxbot.xyz/servers", true)
      .addField(
        `Official server for ${this.client.user.username}:`,
        "https://discord.gg/DfsqmaV",
        true
      )
      .addField(
        "Core Developers:",
        `${(await this.client.users.fetch("358465137516216341")).tag}
                ${(await this.client.users.fetch("272689325521502208")).tag}
                ${(await this.client.users.fetch("209031139791339520")).tag}
                ${(await this.client.users.fetch("131857875973701633")).tag}
                `
      );
    message.send({ embed });
  }
}

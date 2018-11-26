import dateFormat from "dateformat";
const now: Date = new Date();
dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
import { MessageEmbed } from "discord.js";
const statuses: string[] = ["online", "idle", "dnd"];
import { Command, FoxClient } from "../../util";
import { FoxGuild, FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {
  public constructor(client: FoxClient) {
    super(client, {
      name: "serverinfo",
      description: "Shows some information about the current server.",
      guildOnly: true,
      aliases: ["server-info", "server-stats"]
    });
  }

  public run(message: FoxMessage): void {
    const millis: number =
      new Date().getTime() - message.guild.createdAt.getTime();
    const days: number = millis / 1000 / 60 / 60 / 24; //tslint:disable-line
    const verificationLevels: string[] = ["None", "Low", "Medium", "Insane"];
    const server: FoxGuild = message.guild;

    const embed: MessageEmbed = new MessageEmbed()
      .setColor(this.client.brandColor)
      .setAuthor("Server Info", this.client.user.displayAvatarURL())
      .setTimestamp()
      .setThumbnail(server.iconURL() || null) // tslint:disable-line
      .addField("Server name:", server.name, true)
      .addField("Created on:", `${dateFormat(server.createdAt)}`, true)
      .addField("Days since creation:", `${days.toFixed(0)}`, true)
      .addField(
        "Online/Total Members:",
        `${
          message.guild.members.filter(m =>
            statuses.includes(m.presence.status)
          ).size
        } / ${message.guild.memberCount}`,
        true
      ) // tslint:disable-line
      .addField("Channels:", `${server.channels.size}`, true)
      .addField("Region:", `${server.region}`, true)
      .addField("Owner:", `${server.owner.displayName}`, true)
      .addField("Roles:", `${server.roles.size}`, true)
      .addField("Shard #", this.client.shard.id, true)
      .addField(
        "Verification Level:",
        `${verificationLevels[message.guild.verificationLevel]}`,
        true
      )
      .setFooter(`Guild ID: ${server.id}`);
    message.send({ embed });
  }
}

import {
  GuildAuditLogs,
  GuildChannel,
  MessageEmbed,
  TextChannel
} from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "channelUpdate",
      description: "Emitted when a channel is updated."
    });
  }

  public async run(
    oChannel: GuildChannel,
    nChannel: GuildChannel
  ): Promise<void> {
    const guild: FoxGuild = oChannel.guild as FoxGuild;
    const enabled: boolean = guild.config.serverLogging;
    const log: TextChannel = guild.config.serverlogChannel;
    if (!enabled || !log || !guild.channels.get(log.id)) {
      return;
    }
    if (guild.config.enabledEvents.indexOf(this.name) < 0) {
      return;
    }
    const audit: GuildAuditLogs = await guild.fetchAuditLogs();
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Channel Updated", guild.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setThumbnail(audit.entries.first().executor.displayAvatarURL())
      .setFooter(guild.client.user.username)
      .setColor(this.client.brandColor)
      .addField("Old Channel", oChannel, true)
      .addField("New Channel", nChannel, true)
      .addField("Updated By", audit.entries.first().executor.tag, true);
    const cl: TextChannel = guild.channels.get(log.id) as TextChannel;
    if (cl) {
      cl.send(embed);
    }
  }
}

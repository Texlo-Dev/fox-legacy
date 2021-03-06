import {
  Channel,
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
      name: "channelCreate",
      description: "Emitted when a channel is created."
    });
  }

  public async run(channel: GuildChannel): Promise<void> {
    if (channel.type !== "text") return;
    const guild: FoxGuild = channel.guild as FoxGuild;
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
      .setAuthor("Channel Created", guild.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setThumbnail(audit.entries.first().executor.displayAvatarURL())
      .setFooter(guild.client.user.username)
      .setColor(this.client.brandColor)
      .addField("Channel", channel, true)
      .addField("Creator", audit.entries.first().executor.tag, true);
    const cl: TextChannel = guild.channels.get(log.id) as TextChannel;
    if (cl) {
      cl.send(embed);
    }
  }
}

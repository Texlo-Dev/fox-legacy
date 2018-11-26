import {
  GuildAuditLogs,
  GuildEmoji,
  MessageEmbed,
  TextChannel
} from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "emojiUpdate",
      description: "Emitted when a emoji is updated."
    });
  }

  public async run(oEmoji: GuildEmoji, nEmoji: GuildEmoji): Promise<void> {
    const guild: FoxGuild = oEmoji.guild as FoxGuild;
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
      .setAuthor("Emoji Updated", guild.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setThumbnail(audit.entries.first().executor.displayAvatarURL())
      .setFooter(guild.client.user.username)
      .setColor(this.client.brandColor)
      .setDescription(
        `\n**Old Emoji:** ${oEmoji} ${oEmoji.name}\n**New Emoji:** ${nEmoji} ${
          nEmoji.name
        }\n**Updated By:** ${audit.entries.first().executor.tag}`
      ); // tslint:disable-line
    const ch: TextChannel = guild.channels.get(log.id) as TextChannel;
    if (ch) {
      ch.send(embed);
    }
  }
}

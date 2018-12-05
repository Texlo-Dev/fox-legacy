import { GuildAuditLogs, MessageEmbed, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxMessage } from "../util/extensions";

export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "messageDelete",
      description: "Fired whenever a message is deleted in a channel."
    });
  }

  public async run(message: FoxMessage): Promise<void> {
    if (message.author.id === message.client.user.id) {
      return;
    }
    const modlog: TextChannel = message.guild.config.serverlogChannel;
    if (!modlog) {
      return;
    }
    const enabled: boolean = message.guild.config.serverLogging;
    if (!enabled) {
      return;
    }
    const channelExclude: boolean = message.guild.config.logExcluded.some(
      c => c.id === message.channel.id
    );
    if (channelExclude) {
      return;
    }
    if (message.guild.config.enabledEvents.indexOf(this.name) < 0) {
      return;
    }
    const logs: GuildAuditLogs = await message.guild.fetchAuditLogs({
      type: "MESSAGE_DELETE",
      limit: 1
    });
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Message Deleted", message.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setFooter(message.client.user.username)
      .setThumbnail(message.author.displayAvatarURL())
      .setColor(this.client.brandColor)
      .addField("Channel", message.channel, true)
      .addField("Author", message.author.tag, true);
    if (logs.entries.first().executor.id !== message.author.tag) {
      embed.addField("Deleted By", logs.entries.first().executor.tag);
    }
    embed
      .addField(
        "Content",
        message.content.length > 1024
          ? await FoxClient.haste(message.content, "txt").catch(
              () => "Failed to post content to Hastebin."
            )
          : message.content,
        true
      )
      .addField("Message ID", message.id)
      .setFooter(message.client.user.username);
    if (modlog) {
      const serverlog: TextChannel = message.guild.channels.get(
        modlog.id
      ) as TextChannel;
      if (!serverlog) {
        return;
      }
      serverlog.send({ embed });
    }
  }
}

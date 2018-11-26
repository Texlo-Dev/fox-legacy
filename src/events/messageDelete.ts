import { MessageEmbed, TextChannel } from "discord.js";
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
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Message Deleted", message.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setFooter(message.client.user.username)
      .setThumbnail(message.author.displayAvatarURL())
      .setColor(this.client.brandColor)
      .setDescription(
        `
                **Channel:** ${message.channel}
                **Author:** ${message.author.tag}
                **Content:**
                ${message.content}

                **Message ID:** ${message.id}`
      )
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

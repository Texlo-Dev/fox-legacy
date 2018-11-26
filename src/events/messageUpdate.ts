import { MessageEmbed, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import {
  badWords,
  invProtect,
  massProtect,
  spamProtect
} from "../util/core/Automod";
import { FoxMessage } from "../util/extensions";
export default class MUpdate extends Event {
  public static async initAutomod(message: FoxMessage): Promise<void> {
    try {
      badWords(message);
      await invProtect(message);
      await massProtect(message);
      await spamProtect(message);
    } catch (error) {
      console.error(error);
    }
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "messageUpdate",
      description: "Fired when a message is updated in a server."
    });
  }

  public async run(
    oldMessage: FoxMessage,
    newMessage: FoxMessage
  ): Promise<void> {
    if (oldMessage.content === newMessage.content) {
      return;
    }
    if (!oldMessage.guild) {
      return;
    }
    await MUpdate.initAutomod(newMessage);
    if (newMessage.editedTimestamp - oldMessage.createdTimestamp < 30000) {
      newMessage.client.emit("message", newMessage);
    }
    if (oldMessage.author.bot) {
      return;
    }
    const client: FoxClient = oldMessage.client;
    const modlog: TextChannel = oldMessage.guild.config.serverlogChannel;
    const enabled: boolean = oldMessage.guild.config.serverLogging;
    if (!enabled) {
      return;
    }
    const channelExclude: boolean = oldMessage.guild.config.logExcluded.some(
      c => c.id === oldMessage.channel.id
    );
    if (channelExclude) {
      return;
    }
    if (oldMessage.guild.config.enabledEvents.indexOf(this.name) < 0) {
      return;
    }
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Message Updated", newMessage.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setFooter(client.user.username)
      .setThumbnail(oldMessage.author.displayAvatarURL())
      .setColor(0xe0ad1a)
      .setDescription(
        `

                **Channel:** ${oldMessage.channel}
                **Author:** ${oldMessage.author.tag}
                **Old Message:**
                ${oldMessage.content}
                **New message:**
                ${newMessage.content}

                **Message ID:** ${oldMessage.id}`
      )
      .setFooter(oldMessage.client.user.username);
    if (modlog) {
      const serverlog: TextChannel = oldMessage.guild.channels.get(
        modlog.id
      ) as TextChannel;
      if (!serverlog) {
        return;
      }
      serverlog.send({ embed });
    }
  }
}

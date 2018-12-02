import { MessageEmbed } from "discord.js";
import { duration } from "moment";
import "moment-duration-format";
import { Command, FoxClient, Queue, Song } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.listen", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "nowplaying",
      description: "Displays info about the currently playing song.",
      guildOnly: true,
      aliases: ["np"],
      requiredPerms: ["`music.listen`"]
    });
  }

  public run(message: FoxMessage): Promise<FoxMessage> {
    return message.error("This command is currently disabled.");
    const serverQueue: Queue = message.guild.queue;
    if (!serverQueue) {
      return message.error(" Nothing is currently playing.");
    }
    const np: Song = serverQueue.songs[0];
    const songTime: string = duration(
      serverQueue.connection.dispatcher.streamTime,
      "milliseconds"
    ).format("m:ss", { trim: false });
    const songDuration: string = duration(
      parseFloat(np.length),
      "seconds"
    ).format("m:ss", { trim: false });
    const dispatcherSeconds: number =
      serverQueue.connection.dispatcher.streamTime / 1000; // tslint:disable-line
    const remaining: string = duration(
      np.length - dispatcherSeconds,
      "seconds"
    ).format("m:ss", { trim: false });
    const embed: MessageEmbed = new MessageEmbed()
      .setThumbnail(np.thumbnail)
      .setAuthor("Now Playing", message.client.user.displayAvatarURL())
      .setDescription(
        `**${np.title}**\nAuthor: **${
          np.author
        }**\nProgress: **${songTime}/${songDuration} (About ${remaining} left)**`
      ) // tslint:disable-line
      .setColor(this.client.brandColor);

    return message.send({ embed });
  }
}

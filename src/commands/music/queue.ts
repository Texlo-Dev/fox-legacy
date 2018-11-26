import { MessageEmbed } from "discord.js";
import { duration } from "moment";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.listen", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "queue",
      description: "Shows all of the available songs in the queue.",
      guildOnly: true,
      usage: "[page]",
      requiredPerms: ["`music.listen`"]
    });
  }

  public run(
    message: FoxMessage,
    args: string[],
    prefix: string
  ): Promise<FoxMessage> {
    let page: number = parseFloat(args[0]);
    if (!page) {
      page = 1;
    }
    const serverQueue: Queue = message.guild.queue;
    if (!serverQueue) {
      return message.error(" It looks like there are no songs in the queue.");
    }
    const timeArr: number[] = serverQueue.songs.map(song =>
      parseFloat(song.length)
    );
    const totalQueue: string = duration(
      timeArr.reduce((p, val) => p + val, 0) -
        serverQueue.connection.dispatcher.streamTime / 1000,
      "seconds"
    ).format("m:ss", { trim: false });
    const remaining: string = duration(
      serverQueue.songs[0].length -
        serverQueue.connection.dispatcher.streamTime / 1000,
      "seconds"
    ).format("m:ss", { trim: false });
    const paginated: any = FoxClient.paginate(serverQueue.songs, page, 10);
    let num: number = (paginated.page - 1) * 10;
    const embed: MessageEmbed = new MessageEmbed()
      .setColor(this.client.brandColor)
      .setAuthor("Music Queue", this.client.user.displayAvatarURL())
      .setDescription(`
**Current songs, page ${paginated.page}:**

${paginated.items
      .map(
        song =>
          `**#${++num} -** [${song.title}](${song.url}) as requested by ${
            song.requestedBy.displayName
          } (${duration(parseInt(song.length), "seconds").format("m:ss", {
            trim: false
          })})`
      )
      .join("\n")}

**Now Playing:** ${serverQueue.songs[0].title} (${remaining} left)
**Total Queue Time Remaining:** ${totalQueue}
${
      paginated.maxPage > 1
        ? `\nType \`${prefix}queue [pagenumber]\` to see a specific page.`
        : "".trim()
    }`);

    return message.send({ embed });
  }
}

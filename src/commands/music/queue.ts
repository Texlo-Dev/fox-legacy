import { MessageEmbed } from "discord.js";
import { Player } from "lavalink";
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
    const player: Player = this.client.music.players.get(message.guild.id);
    const serverQueue: Queue = player.queue;
    if (!serverQueue || !serverQueue.size) {
      return message.error(" It looks like there are no songs in the queue.");
    }
    const timeArr: number[] = serverQueue.map(song => song.info.length);
    const totalQueue: string = duration(
      timeArr.reduce((p, val) => p + val, 0) - player.position,
      "milliseconds"
    ).format("m:ss", { trim: false });
    const remaining: string = duration(
      serverQueue.first().info.length - player.position,
      "milliseconds"
    ).format("m:ss", { trim: false });

    const paginated: any = FoxClient.paginate(serverQueue.array(), page, 11);
    let num: number = (paginated.page - 1) * 10;
    paginated.items.shift();
    const embed: MessageEmbed = new MessageEmbed()
      .setColor(this.client.brandColor)
      .setTimestamp()
      .setAuthor("Music Queue", this.client.user.displayAvatarURL())
      .setDescription(`
**Current songs, page ${paginated.page}:**

${paginated.items
      .map(
        song =>
          `**#${++num} -** [${song.info.title}](${
            song.info.uri
          }) as requested by ${song.info.requestor.displayName} (${duration(
            song.info.length,
            "milliseconds"
          ).format("m:ss", {
            trim: false
          })})`
      )
      .join("\n") || "No upcoming songs."}

**Now Playing:** ${serverQueue.first().info.title}
**Total Queue Time Remaining:** ${totalQueue}
${
      paginated.maxPage > 1
        ? `\nType \`${prefix}queue [pagenumber]\` to see a specific page.`
        : "".trim()
    }`);

    return message.send({ embed });
  }
}

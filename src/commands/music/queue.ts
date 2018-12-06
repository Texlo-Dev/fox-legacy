import { MessageEmbed } from "discord.js";
import { Player, Track } from "lavalink";
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

    const paginated: any = FoxClient.paginate(serverQueue.array(), page, 6);
    let num: number = (paginated.page - 1) * 6;
    paginated.items.shift();
    const embed: MessageEmbed = new MessageEmbed()
      .setColor(this.client.brandColor)
      .setTimestamp()
      .setFooter(
        `${message.guild.config.prefix}queue <num> for a specific page.`,
        message.author.displayAvatarURL()
      )
      .setAuthor(
        `Music Queue ${
          paginated.maxPage > 1 ? `(Page ${paginated.page})` : "".trim()
        }`,
        this.client.user.displayAvatarURL()
      )
      .addField("Now Playing", serverQueue.first().info.title, true)
      .addField("Queue Time Remaining", totalQueue, true)
      .addField(
        "Songs",
        paginated.items
          .map(
            (song: Track) =>
              `**${++num}** - [${song.info.title}](${
                song.info.uri
              }) as requested by ${song.info.requestor.displayName} (${duration(
                song.info.length,
                "milliseconds"
              ).format("m:ss", {
                trim: false
              })})`
          )
          .join("\n") || "No upcoming songs."
      );
    return message.send({ embed });
  }
}

import { MessageEmbed } from "discord.js";
import { Track } from "lavalink";
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
    const player: Queue = this.client.lavalink.players.get(message.guild.id);
    if (!player.queue) {
      return message.error(
        "Sorry, but there was nothing playing for me to skip."
      ); // tslint:disable-line
    }

    const song: Track = player.queue.first();
    const songTime: string = duration(player.position, "milliseconds").format(
      "m:ss",
      { trim: false }
    );
    const songDuration: string = duration(
      song.info.length,
      "milliseconds"
    ).format("m:ss", { trim: false });
    const remaining: string = duration(
      song.info.length - player.position,
      "milliseconds"
    ).format("m:ss", { trim: false });
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Now Playing", message.client.user.displayAvatarURL())
      .setFooter(
        `Requested by: ${song.info.requestor.displayName}`,
        song.info.requestor.user.displayAvatarURL()
      )
      .setTimestamp()
      .setDescription(
        `**${song.info.title}**\nAuthor: **${
          song.info.author
        }**\nProgress: **${songTime}/${songDuration} (About ${remaining} left)**`
      ) // tslint:disable-line
      .setColor(this.client.brandColor);

    return message.send({ embed });
  }
}

import {
  GuildMember,
  MessageEmbed,
  Permissions,
  VoiceChannel
} from "discord.js";
import Node, { Player, Track, TrackResponse } from "lavalink";
import { duration } from "moment";
import "moment-duration-format";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.listen", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "play",
      description: "Plays some music from youtube.",
      usage: "<platform> <name|link>",
      guildOnly: true,
      aliases: ["yt"],
      requiredPerms: ["`music.listen`"]
    });
  }

  public async addVideo(
    track: Track,
    mg: FoxMessage,
    playlist: boolean = false
  ): Promise<FoxMessage> {
    const music: Node = this.client.lavalink;
    const player: Player = music.players.get(mg.guild.id);
    if (!player.queue) {
      track.info.requestor = mg.member;
      player.queue = new Queue(this.client).set(track.info.identifier, track);
      if (playlist) return;

      return this.playVideo(track, mg);
    } else {
      track.info.requestor = mg.member;
      player.queue.set(track.info.identifier, track);
      if (playlist) return;
      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor("Music", this.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(
          `Requested by ${mg.member.displayName}`,
          mg.member.user.displayAvatarURL()
        )
        .setDescription(
          `Successfully added **${
            track.info.title
          }** to the queue!\nAuthor: **${
            track.info.author
          }**\nLength: **${duration(track.info.length, "milliseconds").format(
            "m:ss",
            {
              trim: false
            }
          )}**`
        )
        .setColor(this.client.brandColor);

      return mg.send({ embed });
    }
  }

  public async playVideo(track: Track, mg: FoxMessage): Promise<FoxMessage> {
    const music: Node = this.client.lavalink;
    const player: Player = music.players.get(mg.guild.id);
    if (!track) {
      await player.stop();
      await player.leave();
      player.queue = null;

      return mg.send(
        "<:dnd:313956276893646850> Queue has finished, leaving voice channel."
      );
    }
    player.queue.skippers = [];
    try {
      await player.join(mg.guild.me.voice.channel ? mg.guild.me.voice.id : mg.member.voice.channel.id);
      await player.play(track);

      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor("Music", this.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(
          `Requested by ${mg.member.displayName}`,
          mg.member.user.displayAvatarURL()
        )
        .setDescription(
          `Now Playing - **${track.info.title}**\nAuthor: **${
            track.info.author
          }**\nLength: **${duration(track.info.length, "milliseconds").format(
            "m:ss",
            {
              trim: false
            }
          )}**`
        )
        .setColor(this.client.brandColor);

      mg.channel.send(embed);
      player.on("playerUpdate", ({ state: { position } }) =>
        player.position = position);
      player.on("event", ({ reason }) => {
        if (reason === "FINISHED") {
          player.queue.delete(track.info.identifier);
          player.queue.skippers = [];
          setTimeout(() => this.playVideo(player.queue.first(), mg), 2000);
        }
      });
    } catch (error) {
      return mg.error(`Error while attempting to play track. ${error}`);
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const platform: string = args[0];
    const song: string = args.slice(1).join(" ");
    if (!platform || !["yt", "sc"].includes(platform)) {
      return message.error(
        "Invalid platform.\nAvailable platforms - \nyt = YouTube\nsc = SoundCloud"
      );
    }
    if (!song) return message.error("Please specify a song to play.");
    const member: GuildMember = await message.guild.members.fetch(
      message.author
    );
    const voiceChannel: VoiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return message.error("Sorry, but you are not in a voice channel.");
    }
    const permissions: Readonly<
      Permissions
    > = member.voice.channel.permissionsFor(message.guild.me);
    if (!permissions.has("CONNECT")) {
      return message.error(
        "Sorry, but I do not have permissions to connect to this voice channel."
      );
    }
    if (!permissions.has("SPEAK")) {
      return message.error(
        "Sorry, but I do not have permissions to speak in this voice channel."
      );
    }

    const music: Node = this.client.lavalink;
    let res: TrackResponse;
    const queue: Queue = music.players.get(message.guild.id).queue;
    if (queue && queue.size > 1 && !message.author.upvoter) return message.error("Your song queue limit is currently at 2 songs as a non-upvoter. To increase your queue limit, please upvote the bot on DiscordBots.org, it's free! https://discordbots.org/bot/mrfox");
    else if (queue && queue.size > 4 && message.author.patreonTier < 1)
      return message.error("Your song queue limit is currently at 4 songs as a free user. To increase your queue limit, please consider upgrading to a Bronze Fox Patreon or higher here:https://www.patreon.com/foxdevteam");
    const isLink: RegExpMatchArray =
      song.match(/^https?:\/\/(www.youtube.com|youtube.com)/) ||
      song.match(/^https?:\/\/(www.soundcloud.com|soundcloud.com)/);
    res = isLink
      ? await music.load(song)
      : await music.load(`${platform}search:${encodeURIComponent(song)}`);
    if (!res.tracks || !res.tracks.length)
      return message.error("No tracks were found.");
    if (isLink && !res.playlistInfo.name)
      return this.addVideo(res.tracks[0], message);
    else if (isLink) {
      let num: number = 0;
      const tracks: Track[] = res.tracks.slice(0, 10);
      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor("Playlist Selection", this.client.user.displayAvatarURL())
        .setDescription(
          `Playlist detected. Showing first ${
            tracks.length
          } results.\n${tracks
            .map(v => `**${++num}** - ${v.info.title} by ${v.info.author}`)
            .join(
              "\n"
            )}\n\nType "all" to play all songs, or enter a number from 1-${
            tracks.length
          }.`
        )
        .setColor(this.client.brandColor)
        .setTimestamp()
        .setFooter(this.client.user.username);
      const choice: string | number = await message.sendPrompt(embed, 15000);
      // tslint:disable-next-line:switch-default
      switch (choice) {
        case undefined:
          return message.error("No response detected, so cancelled command.");
        case 0:
          return message.error("Cancelling command.");
        case "all":
          for await (const tk of res.tracks) {
            this.addVideo(tk, message, true);
          }
          const playembed: MessageEmbed = new MessageEmbed()
            .setAuthor("Music Player", this.client.user.displayAvatarURL())
            .setDescription(
              `Downloaded Playlist.\n**Playlist Name:** ${
                res.playlistInfo.name
              }\n**Song Count:** ${res.tracks.length}\n**Total Play Time:** ${duration(
                res.tracks.map(r => r.info.length)
                .reduce((prev, val) => prev + val, 0), "milliseconds")
                .format(
                "h [hours, ] m [minutes]."
              )}`
            )
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(this.client.user.username);
          await message.channel.send({ embed: playembed });
          const player: Player = music.players.get(message.guild.id);
          if (!player.playing) await this.playVideo(player.queue.first(), message);
          break;
        default:
          const pnum: number = Number(choice);
          const selected: Track = res.tracks[pnum - 1];
          if (!selected) return message.error("Invalid track selected.");

          return this.addVideo(selected, message);
      }
    } else {
      const tracks: Track[] = res.tracks.slice(0, 10);
      let num: number = 0;
      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor("Music Selection", this.client.user.displayAvatarURL())
        .setDescription(
          `Here are the top ${
            tracks.length
          } results for **${song}**:\n${tracks
            .map(v => `**${++num}** - ${v.info.title} by ${v.info.author}`)
            .join("\n")}\n\nPlease enter a number from 1-${tracks.length}.`
        )
        .setColor(this.client.brandColor)
        .setTimestamp()
        .setFooter(this.client.user.username);
      const resp: string | number = await message.sendPrompt(embed, 15000);
      // tslint:disable-next-line:switch-default
      switch (resp) {
        case undefined:
          return message.error("No response detected, so cancelled command.");
        case 0:
          return message.error("Cancelling command.");
      }
      const tnum: number = Number(resp);
      const track: Track = tracks[tnum - 1];
      if (!track) return message.error("Invalid track selected.");
      if (track.info.length >= 360000 && message.author.patreonTier < 1)
        return message.error("Your song queue limit is currently at 4 songs as a free user. To increase your queue limit, please consider upgrading to a Bronze Fox Patreon or higher here:https://www.patreon.com/foxdevteam");

      return this.addVideo(track, message);
    }
  }
}

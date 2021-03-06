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
      description: "Plays some music from a preferred streaming service.",
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
    const music: Node = this.client.music;
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
        .setAuthor("Song Added To Queue", this.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(
          `Requested by ${mg.member.displayName}`,
          mg.member.user.displayAvatarURL()
        )
        .addField("Name", `[${track.info.title}](${track.info.uri})`)
        .addField("Author", track.info.author, true)
        .addField(
          "Length",
          duration(track.info.length, "milliseconds").format("m:ss", {
            trim: false
          }),
          true
        )
        .setColor(this.client.brandColor);

      return mg.send({ embed });
    }
  }

  public async fetchMusic(
    message: FoxMessage,
    platform: string,
    song: string
  ): Promise<FoxMessage> {
    const music: Node = this.client.music;
    let res: TrackResponse;
    const isLink: RegExpMatchArray =
      song.match(/^https?:\/\/(www.youtube.com|youtube.com)/) ||
      song.match(/^https?:\/\/(www.soundcloud.com|soundcloud.com)/);
    res = isLink
      ? await music.load(song)
      : await music.load(`${platform}search:${song}`);
    if (!res.tracks || !res.tracks.length)
      return message.error("No tracks were found.");
    if (isLink && !res.playlistInfo.name)
      return this.addVideo(res.tracks[0], message);
    else if (isLink) {
      return this.handlePlaylist(res, message, song);
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
        return message.error(
          "Your song length limit is currently at 5 minutes as a free user. To increase your max song length limit, please consider upgrading to a Bronze Fox Patreon or higher here:https://www.patreon.com/foxdevteam" // tslint:disable-line
        );

      return this.addVideo(track, message);
    }
  }

  public async handlePlaylist(
    res: TrackResponse,
    message: FoxMessage,
    song: string
  ): Promise<FoxMessage> {
    let num: number = 0;
    const music: Node = this.client.music;
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
          res.tracks.length
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
          .setAuthor(
            "Playlist Downloaded!",
            this.client.user.displayAvatarURL()
          )
          .addField("Playlist Name", `[${res.playlistInfo.name}](${song})`, true)
          .addField("Song Count", res.tracks.length, true)
          .addField(
            "Total Play Time",
            duration(
              res.tracks
                .map(r => r.info.length)
                .reduce((prev, val) => prev + val, 0),
              "milliseconds"
            ).format("h [hours, ] m [minutes]."),
            true
          )
          .setColor(this.client.brandColor)
          .setTimestamp()
          .setFooter(`Requested by ${message.member.displayColor}`, message.author.displayAvatarURL());
        await message.channel.send({ embed: playembed });
        const player: Player = music.players.get(message.guild.id);
        if (!player.playing)
          await this.playVideo(player.queue.first(), message);
        break;
      default:
        const pnum: number = Number(choice);
        const selected: Track = res.tracks[pnum - 1];
        if (!selected) return message.error("Invalid track selected.");

        return this.addVideo(selected, message);
    }
  }

  public async playVideo(track: Track, mg: FoxMessage): Promise<FoxMessage> {
    const music: Node = this.client.music;
    const player: Player = music.players.get(mg.guild.id);
    if (!track) {
      await player.stop();
      await player.leave();
      music.players.delete(mg.guild.id);
      player.queue = null;

      return mg.send(
        "<:dnd:313956276893646850> Queue has finished, leaving voice channel."
      );
    }
    if (player.playing) return;
    player.queue.skippers = [];
    try {
      await player.join(
        mg.guild.me.voice.channel
          ? mg.guild.me.voice.channel.id
          : mg.member.voice.channel.id
      );
      await player.play(track);

      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor("Music Player", this.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(
          `Requested by ${mg.member.displayName}`,
          mg.member.user.displayAvatarURL()
        )
        .addField(
          "Now Playing",
          `[${track.info.title}](${track.info.uri})`
        )
        .addField("Author", track.info.author, true)
        .addField(
          "Length",
          duration(track.info.length, "milliseconds").format("m:ss", {
            trim: false
          }),
          true
        )
        .setColor(this.client.brandColor);

      mg.channel.send(embed);
      player.once("event", ({ reason }) => {
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

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const platform: string = args[0].toLowerCase();
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

    const music: Node = this.client.music;
    const queue: Queue = music.players.get(message.guild.id).queue;
    if (queue && queue.size > 1 && !message.author.upvoter)
      return message.error(
        "Your song queue limit is currently at 2 songs as a non-upvoter. To increase your queue limit, please upvote the bot on DiscordBots.org, it's free! https://discordbots.org/bot/mrfox" // tslint:disable-line
      );
    else if (queue && queue.size > 4 && message.author.patreonTier < 1)
      return message.error(
        "Your song queue limit is currently at 4 songs as a free user. To increase your queue limit, please consider upgrading to a Bronze Fox Patreon or higher here:https://www.patreon.com/foxdevteam" // tslint:disable-line
      );

    return this.fetchMusic(message, platform, song);
  }
}

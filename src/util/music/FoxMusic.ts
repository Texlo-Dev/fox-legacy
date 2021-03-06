import {
  GuildMember,
  MessageEmbed,
  StreamDispatcher,
  TextChannel,
  VoiceConnection,
  VoiceChannel
} from "discord.js";
import YoutubeAPI from "simple-youtube-api";
import ytdl from "ytdl-core";
import { googleAPI as apikey } from "../../config.json";
const youtube = new YoutubeAPI(apikey);
import { duration } from "moment";
import "moment-duration-format";
import { FoxClient } from "../";
import { FoxGuild, FoxMessage, FoxUser } from "../extensions/index.js";
import Queue from "./Queue";
import Song from "./Song";

class FoxMusic {
  public client: FoxClient;

  public constructor(client: FoxClient) {
    this.client = client;
  }

  public async getID(
    args: string,
    message: FoxMessage,
    member: GuildMember
  ): Promise<FoxMessage> {
    if (
      args.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)
    ) {
      const times: any[] = [];
      const playlist: any = await youtube.getPlaylist(args);
      const videos: any = await playlist.getVideos();
      if (videos.length > 5 && !message.author.patreonTier) {
        return message.error(
          "Sorry, but YouTube playlists are limited to 5 songs as a free user. To remove this limit, consider becoming a Patreon today, to recieve exclusive features, including enhanced music playback.\nhttps://www.patreon.com/foxdevteam"
        ); // tslint:disable-line
      }

      for (const video of Object.values(videos)) {
        const video2: any = await youtube.getVideoByID((video as any).id);
        times.push(video2.durationSeconds);
        await this.handleVideo(
          video2,
          message,
          member,
          member.voice.channel,
          true
        );
      }

      const timeArr: number[] = times.map(parseInt);
      const time: number = timeArr.reduce((prev, val) => prev + val, 0);
      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor("Music", this.client.user.displayAvatarURL())
        .setDescription(
          `Playlist **${
            playlist.title
          }** has been added to the queue!\nAuthor: **${
            playlist.channel.title
          }**\nLength: Around **${duration(time, "seconds").format(
            "h [hours and] m [minutes]."
          )}**`
        )
        .setColor(this.client.brandColor);

      return message.send({ embed });
    } else {
      try {
        const video = await youtube.getVideo(args);

        return this.handleVideo(video, message, member, member.voice.channel);
      } catch (error) {
        try {
          const videos = await youtube.searchVideos(args, 5);
          let num: number = 0;
          const embed: MessageEmbed = new MessageEmbed()
            .setAuthor("Music Selection", this.client.user.displayAvatarURL())
            .setDescription(
              `Here are the top 5 results for **${args}**:\n${videos
                .map(v => `**${++num}** - ${v.title} by ${v.channel.title}`)
                .join("\n")}\n\nPlease enter a number from 1-5.`
            )
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(this.client.user.username);
          message.send({ embed });
          let res: any;
          try {
            res = await message.channel.awaitMessages(
              m => m.author.id === message.author.id,
              {
                max: 1,
                time: 15000,
                errors: ["time"]
              }
            );
          } catch (error) {
            return message.error("Sorry, but that wasn't a valid selection.");
          }
          const index: number = parseFloat(res.first().content);
          const video = await youtube.getVideoByID(videos[index - 1].id);
          res.first().delete();

          return this.handleVideo(video, message, member, member.voice.channel);
        } catch (error) {
          return message.error(" Sorry, I couldn't find any results.");
        }
      }
    }
  }

  public async handleVideo(
    video,
    message: FoxMessage,
    member: GuildMember,
    voiceChannel: VoiceChannel,
    playlist = false
  ): Promise<FoxMessage> {
    // tslint:disable-line
    const upvoter: FoxUser = message.author;
    const song: Song = new Song(this.client, {
      title: video.title,
      author: video.channel.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      requestedBy: member,
      length: video.durationSeconds,
      thumbnail: video.thumbnails.standard
        ? video.thumbnails.standard.url
        : video.thumbnails.default.url
    });

    const serverQueue: Queue = message.guild.queue;
    if (!serverQueue) {
      const queueStruct: Queue = (message.guild.queue = new Queue(this.client, {
        textChannel: message.channel,
        voiceChannel,
        connection: undefined,
        songs: [],
        skippers: [],
        playing: true
      }));
      queueStruct.songs.push(song);

      try {
        const connection: VoiceConnection = await voiceChannel.join();
        queueStruct.connection = connection;
        this.play(message.guild, queueStruct.songs[0]);
      } catch (error) {
        console.error(error);
        message.guild.queue = null;

        return message.error(
          `Sorry, I couldn't join this voice channel: ${error}`
        );
      }
    } else {
      if (
        !playlist &&
        serverQueue.songs.filter(
          s => s.requestedBy.id === message.author.id
        ).length >= 5 &&
        message.author.patreonTier < 2
      ) {
        return message.error(
          "Your song queue limit is currently at 3 songs as a Bronze Fox Patreon. To increase your queue limit, please consider upgrading to a Silver Fox Patreon or higher here:https://www.patreon.com/foxdevteam"
        );
      }
      serverQueue.songs.push(song);
      if (playlist) {
        return;
      }
      const embed: MessageEmbed = new MessageEmbed()
        .setThumbnail(song.thumbnail)
        .setAuthor("Music", message.client.user.displayAvatarURL())
        .setDescription(
          `Successfully added **${song.title}** to the queue!\nAuthor: **${
            song.author
          }**\nLength: **${duration(song.length, "seconds").format("m:ss", {
            trim: false
          })}**`
        )
        .setColor(this.client.brandColor);

      return message.send({ embed });
    }
  }

  public play(guild: FoxGuild, song: Song): void {
    const serverQueue: Queue = guild.queue;
    if (!song) {
      setTimeout(() => {
        serverQueue.voiceChannel.leave();
        serverQueue.textChannel.send(
          "<:dnd:313956276893646850>  Queue is empty. Queue up some more tunes!"
        );
        guild.queue = null;
      },         1500);

      return;
    }
    serverQueue.skippers = [];
    const dispatcher: StreamDispatcher = serverQueue.connection.play(
      ytdl(song.url, { filter: "audioonly" }),
      { bitrate: "auto" }
    );
    const embed: MessageEmbed = new MessageEmbed()
      .setThumbnail(song.thumbnail)
      .setAuthor("Music", this.client.user.displayAvatarURL())
      .setDescription(
        `Now Playing: **${song.title}**\nAuthor: **${
          song.author
        }**\nLength: **${duration(song.length, "seconds").format("m:ss", {
          trim: false
        })}**`
      )
      .setColor(this.client.brandColor);
    serverQueue.textChannel.send({ embed });

    dispatcher.on("end", () => {
      serverQueue.songs.shift();
      setTimeout(() => this.play(guild, serverQueue.songs[0]), 2000);
    });
  }
}

export default FoxMusic;

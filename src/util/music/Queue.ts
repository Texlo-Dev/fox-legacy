import {
  Collection,
  GuildMember,
  Message,
  TextChannel,
  VoiceChannel,
  VoiceConnection
} from "discord.js";
import { Player } from "lavalink";
import { FoxClient, Song } from "..";
import { FoxGuild, FoxMessage } from "../extensions";

interface QueueInfo {
  skippers: string[];
}

export default class Queue extends Collection<any, any> implements QueueInfo {
  public client: FoxClient;
  public skippers: string[];

  public constructor(client: FoxClient) {
    super();
    this.client = client;
    this.skippers = [];
  }

  public async endAllSongs(message: FoxMessage): Promise<FoxMessage> {
    const player: Player = this.client.music.players.get(message.guild.id);
    player.queue = null;
    await player.stop();
    await player.leave();

    return message.success("Successfully stopped music player.");
  }

  public async pause(message: FoxMessage): Promise<FoxMessage> {
    if (!message.guild.me.voice.channel) {
      return message.error(" I must be in a voice channel first.");
    }
    const player: Player = this.client.music.players.get(message.guild.id);
    await player.pause();

    return message.success("Successfully paused the current song.");
  }

  public async resume(message: FoxMessage): Promise<FoxMessage> {
    if (!message.guild.me.voice.channel) {
      return message.error(" I must be in a voice channel first.");
    }
    const player: Player = this.client.music.players.get(message.guild.id);
    await player.pause(false);

    return message.success("Successfully resumed the current song.");
  }

  public async skip(message: FoxMessage): Promise<any> {
    const player: Player = this.client.music.players.get(message.guild.id);
    if (!player) {
      return message.error(
        "Sorry, but there was nothing playing for me to skip."
      ); // tslint:disable-line
    }
    if (this.skippers.includes(message.member.id)) {
      return message.error("Sorry, but you have already voted to skip!");
    }
    await this.skippers.push(message.member.id);
    if (
      this.skippers.length >
      Math.floor(message.member.voice.channel.members.size - 1) / 3
    ) {
      await player.stop();
      player.emit("event", { reason: "FINISHED" });

      return message.success("Successfully skipped the current song.");
    } else {
      return message.success(
        `Your skip has been added! To complete the skip, you need ${Math.ceil(
          (message.member.voice.channel.members.size - 1) / 2
        ) - this.skippers.length} more votes.`
      ); // tslint:disable-line
    }
  }

  public async volume(int: number, message: FoxMessage): Promise<FoxMessage> {
    const player: Player = this.client.music.players.get(message.guild.id);
    await player.setVolume(int);

    return message.success(`Set the player volume to ${int}%`);
  }
}

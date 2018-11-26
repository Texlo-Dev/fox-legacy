import { GuildMember } from "discord.js";
import { FoxClient } from "..";

interface SongInfo {
  author: string;
  length: any;
  requestedBy: GuildMember;
  thumbnail: string;
  title: string;
  url: string;
}

export default class Song implements SongInfo {
  public author: string;
  public length: any;
  public requestedBy: GuildMember;
  public thumbnail: string;
  public title: string;
  public url: string;

  public constructor(client: FoxClient, info: SongInfo) {
    this.title = info.title;
    this.author = info.author;
    this.length = info.length;
    this.thumbnail = info.thumbnail;
    this.url = info.url;
    this.requestedBy = info.requestedBy;
  }
}

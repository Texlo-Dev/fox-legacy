import { FoxClient } from "..";
import { GuildMember } from "discord.js";

interface SongInfo {
    title: string;
    author: string;
    length: any;
    thumbnail: string;
    url: string;
    requestedBy: GuildMember;
}

export default class Song implements SongInfo {
    public title: string;
    public author: string;
    public length: any;
    public thumbnail: string;
    public url: string;
    public requestedBy: GuildMember;

    public constructor(client: FoxClient, info: SongInfo) {
        this.title = info.title;
        this.author = info.author;
        this.length = info.length;
        this.thumbnail = info.thumbnail;
        this.url = info.url;
        this.requestedBy = info.requestedBy;
    }

}

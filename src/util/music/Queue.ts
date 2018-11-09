import { GuildMember, Message, TextChannel, VoiceChannel, VoiceConnection } from "discord.js";
import { FoxClient, Song } from "..";
import { FoxGuild } from "../extensions";

interface QueueInfo {
    connection: VoiceConnection;
    playing: boolean;
    skippers: string[];
    songs: Song[];
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
}

export default class Queue implements QueueInfo {
    public client: FoxClient;
    public connection: VoiceConnection;
    public playing: boolean;
    public skippers: string[];
    public songs: Song[];
    public textChannel: TextChannel;
    public voiceChannel: VoiceChannel;

    public constructor(client: FoxClient, info: QueueInfo) {
        this.client = client;
        this.textChannel = info.textChannel;
        this.voiceChannel = info.voiceChannel;
        this.connection = info.connection;
        this.songs = info.songs;
        this.skippers = info.skippers;
        this.playing = info.playing;
    }

    public endAllSongs(): boolean | Promise<Message | Message[]> {
        const serverQueue = (this.textChannel.guild as FoxGuild).queue;
        // Check if there are songs in queue to stop.
        // Doesn't use brackets because Jacz has weird formatting.
        if (!serverQueue.songs.length) { return this.textChannel.send("<:nicexmark:495362785010647041>  There is nothing playing for me to stop."); }
        serverQueue.songs = [];
        if (!serverQueue.connection) { return null; }
        serverQueue.connection.dispatcher.end();
        return true;
    }

    public pause() {
        try {
            this.textChannel.guild.voiceConnection.dispatcher.pause();
            return this.textChannel.send("<:away:313956277220802560> Successfully paused the current song.");
        } catch (err) {
            return this.textChannel.send(`Oops, there was an error! ${err}`);
        }
    }

    public resume() {
        try {
            this.textChannel.guild.voiceConnection.dispatcher.resume();
            return this.textChannel.send("<:away:313956277220802560> Successfully resumed the current song.");
        } catch (err) {
            return this.textChannel.send(`Oops, there was an error! ${err}`);
        }
    }

    public async skip(member: GuildMember): Promise<Message | Message[]> {
        const serverQueue = (member.guild as FoxGuild).queue;
        if (!serverQueue) { return this.textChannel.send("<:nicexmark:495362785010647041>  Sorry, but there was nothing playing for me to skip."); }
        if (serverQueue.skippers.includes(member.id)) { return this.textChannel.send("<:nicexmark:495362785010647041>  Sorry, but you have already voted to skip!"); }
        await serverQueue.skippers.push(member.id);
        if (serverQueue.skippers.length > Math.floor(member.voice.channel.members.size - 1) / 3) {
            serverQueue.connection.dispatcher.end();
            return this.textChannel.send("<:check:314349398811475968> Successfully skipped the current song.");
        } else {
            return this.textChannel.send(`<:check:314349398811475968> Your skip has been added! To complete the skip, you need ${Math.ceil((member.voice.channel.members.size - 1) / 2) - serverQueue.skippers.length} more votes.`);
        }
    }

}

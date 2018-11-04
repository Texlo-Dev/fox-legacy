import { FoxGuild } from "../extensions";

interface GiveawayInfo {
    name: string;
    guildID: string;
    channel: any;
    endDate: number;
    running: boolean;
    messageID?: string;
    winners: any[];
    paused: boolean;
    maxWinners: number;
    reactionEmote: any;
    timeRemaining: number;
}

export default class Giveaway implements GiveawayInfo {
    public guild: FoxGuild;
    public name: string;
    public guildID: string;
    public channel: any;
    public endDate: number;
    public running: boolean;
    public messageID: string;
    public winners: any[];
    public paused: boolean;
    public maxWinners: number;
    public timeRemaining: number;
    public reactionEmote: any;
    public ended?: boolean;

    public constructor(guild: FoxGuild, info: GiveawayInfo) {
        this.guild = guild;
        this.name = info.name;
        this.guildID = info.guildID;
        this.channel = info.channel;
        this.endDate = info.endDate;
        this.running = info.running;
        this.messageID = info.messageID;
        this.winners = info.winners;
        this.paused = info.paused;
        this.maxWinners = info.maxWinners;
        this.timeRemaining = info.timeRemaining;
        this.reactionEmote = info.reactionEmote;
    }

    public async end(): Promise<Object> {
        if (!this.running) throw new Error("Giveaway must be running in order to end.");
        this.ended = true;

        try {
            const guild = this.guild.client.guilds.get(this.guildID) as FoxGuild;
            return await guild.giveaways.listenGiveaway(this);
        } catch (err) {
            throw err;
        }
    }

    public async reroll(): Promise<Object> {
        if (this.running) throw new Error("Giveaway must not be running to reroll.");
        try {
            const guild = this.guild.client.guilds.get(this.guildID) as FoxGuild;
            return await guild.giveaways.reroll(this);
        } catch (err) {
            throw err;
        }
    }

    public async pause(): Promise<Object> {
        if (this.paused || !this.running) throw new Error("Giveaway must not either be already paused and currently running.");
        try {
            const guild = this.guild.client.guilds.get(this.guildID) as FoxGuild;
            return await guild.giveaways.pause(this);
        } catch (err) {
            throw err;
        }
    }

    public async resume(): Promise<Object> {
        if (!this.paused || !this.running) throw new Error("Giveaway must be already paused and currently running.");
        try {
            const guild = this.guild.client.guilds.get(this.guildID) as FoxGuild;
            return await guild.giveaways.resume(this);
        } catch (err) {
            throw err;
        }
    }

}

import { FoxGuild } from "../extensions";
// tslint:disable-next-line:interface-name
interface GiveawayInfo {
    channel: any;
    endDate: number;
    guildID: string;
    maxWinners: number;
    messageID?: string;
    name: string;
    paused: boolean;
    reactionEmote: any;
    running: boolean;
    timeRemaining: number;
    winners: any[];
}

export default class Giveaway implements GiveawayInfo {
    public channel: any;
    public endDate: number;
    public ended?: boolean;
    public guild: FoxGuild;
    public guildID: string;
    public maxWinners: number;
    public messageID: string;
    public name: string;
    public paused: boolean;
    public reactionEmote: any;
    public running: boolean;
    public timeRemaining: number;
    public winners: any[];

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
        if (!this.running) { throw new Error("Giveaway must be running in order to end."); }
        this.ended = true;

        try {
            const guild: FoxGuild = this.guild.client.guilds.get(this.guildID) as FoxGuild;

            return guild.giveaways.listenGiveaway(this);
        } catch (err) {
            throw err;
        }
    }

    public async pause(): Promise<Object> {
        if (this.paused || !this.running) {
            throw new Error("Giveaway must not either be already paused and currently running.");
        }
        try {
            const guild: FoxGuild = this.guild.client.guilds.get(this.guildID) as FoxGuild;

            return guild.giveaways.pause(this);
        } catch (err) {
            throw err;
        }
    }

    public async reroll(): Promise<Object> {
        if (this.running) { throw new Error("Giveaway must not be running to reroll."); }
        try {
            const guild: FoxGuild = this.guild.client.guilds.get(this.guildID) as FoxGuild;

            return guild.giveaways.reroll(this);
        } catch (err) {
            throw err;
        }
    }

    public async resume(): Promise<Object> {
        if (!this.paused || !this.running) {
            throw new Error("Giveaway must be already paused and currently running.");
        }
        try {
            const guild: FoxGuild = this.guild.client.guilds.get(this.guildID) as FoxGuild;

            return guild.giveaways.resume(this);
        } catch (err) {
            throw err;
        }
    }

}

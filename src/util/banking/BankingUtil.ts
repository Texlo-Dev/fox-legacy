// tslint:disable:no-parameter-reassignment interface-name
import { GuildMember, Message, MessageMentions, Role, TextChannel, User } from "discord.js";
import { FoxClient } from "..";
import { FoxGuild, FoxMessage } from "../extensions";
import { FoxBank } from "../Mongo";

interface MoneyOptions {
    amount?: number;
    guild: FoxGuild;
}

export default class Banking {

    public static checkEligibility(member: GuildMember, channel: TextChannel): boolean {
        const excludedRoles: Role[] = (member.guild as FoxGuild).banking.excludedRoles;
        const excludedChannels: TextChannel[] = (member.guild as FoxGuild).banking.excludedChannels;
        if (excludedRoles.length && excludedRoles.some(role => member.roles.has(role.id))) {
            return false;
        } else if (excludedChannels.length && excludedChannels.some(c => c.id === channel.id)) {
            return false;
        }

        return true;
    }

    public static randomNum(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min)) + min;
    }

    public static validate(message: FoxMessage): boolean {
        const text: string = message.content.toLowerCase();
        const mentions: MessageMentions = message.mentions;

        const substantialWords: string[] = [
            "js", "javascript", "node", "nodejs", "code", "pars", "script", "clojure", "sql",
            "discord", "moment", "snekfetch", "dithcord", "guide", "video", "bot", "dev", "git",
            "github", "discord.js", "snekie", "mod.banhammer", "mrfox", "rtexel", "jacz", "the", "this",
            "that", "hello",
            // @ts-ignore
        ].concat(Object.keys(process.binding("natives")));

        // Words that might indicate that this message is lower quality
        const insubstantialWords: string[] = [
            "lol", "lul", "lel", "kek", "xd", "¯\\_(ツ)_/¯", "dicksword", "gus", "kys", "dumbass",
            "!", "-", ".", message.guild.config.prefix
        ];
        const necessarySubstance: number = 10;
        if (mentions.roles.some((r) => [message.guild.id].includes(r.id))) { return false; }
        let substance: number = 0;
        if (text.length > "lol xD".length) (substance += 400) * ((substance - 5) / 1995) + 7; // tslint:disable-line
        substance += substantialWords.reduce((num, word) => text.includes(word) ? num + 2 : num, 0);
        substance -= insubstantialWords.reduce((num, word) => text.includes(word) ? num + 1 : num, 0);
        if (mentions.users.size > 0) {
            substance -= mentions.users.size;
        } else if (mentions.roles.size > 3) {
            substance -= mentions.roles.size;
        } else if (mentions.channels.size > 5) {
            substance -= mentions.channels.size;
        } else { substance += 2;
        }

        return substance >= necessarySubstance;
    }

    public client: FoxClient;
    public currency: string;
    public excludedChannels: any[];
    public excludedRoles: [];
    public guild: FoxGuild;
    public shopItems: any[];
    public shopName: string;

    public constructor(guild: FoxGuild) {
        this.guild = guild;
        this.client = guild.client;
        this.shopItems = [];
        this.excludedChannels = [];
        this.excludedRoles = [];
        this.currency = "¥‎";
        this.shopName = "The Fox Store";
    }

    public async _loadSettings(): Promise<void> {
        const settings: FoxBank = await this.guild.client.mongo.banking.findOne({
            guildID: this.guild.id,
            type: "settings",
        });
        if (!settings) {
            const banking: FoxBank = new this.guild.client.mongo.banking({
                guildID: this.guild.id,
                type: "settings",
            });
            await banking.save();
        } else {
            for (const key of Object.keys(this)) {
                if (key === "guild" || key === "client") { continue; }
                const value: any = settings.get(key);
                if (value !== undefined) { this[key] = value; }
            }
        }
    }

    public async addMoney(user: any, options: MoneyOptions): Promise<boolean> {
        if (user instanceof User || user instanceof GuildMember) { user = user.id; }
        if (user instanceof Message) { user = user.author.id; }
        const giveMember: FoxBank = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user,
        });
        if (!giveMember) { return undefined; }
        const toUser: number = giveMember.get("money") + options.amount;
        giveMember.set({ money: toUser });
        await giveMember.save();

        return true;
    }

    public async balanceOf(member: GuildMember): Promise<number> {
        const mem: FoxBank = await (member.guild as FoxGuild).client.mongo.banking.findOne({
            guildID: member.guild.id,
            userID: member.id,
        });
        if (!mem) { return NaN; }

        return mem.get("money");
    }

    public async giveDaily(user: any, options: MoneyOptions): Promise<number | boolean> {
        if (user instanceof User || user instanceof GuildMember) { user = user.id; }
        if (user instanceof Message) { user = user.author.id; }

        const entry: FoxBank = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user,
        });
        if (!entry) { return false; }
        const time: number = entry.get("timeUntilDaily") - Date.now();
        if (entry.get("timeUntilDaily") >= Date.now()) { return time; }
        const toUser: number = entry.get("money") + 500;
        entry.set({
            money: toUser,
            timeUntilDaily: Date.now() + 86400000,
        });
        await entry.save();

        return true;
    }

    public async listen(message: FoxMessage): Promise<Banking> {
        if (!message.guild) { return; }
        if (!Banking.validate(message)) { return; }
        if (message.command) { return; }
        if (!message.guild.packages.get("Economy").enabled) { return; }
        const isEligible: boolean = Banking.checkEligibility(message.member, message.channel);
        if (!isEligible) { return; }

        const entry: FoxBank = await message.guild.client.mongo.banking.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
        });
        if (!entry) {
            const ent: FoxBank = new message.client.mongo.banking({
                guildID: message.guild.id,
                userID: message.author.id,
                money: 0,
                timeUntilDaily: Date.now(),
            });
            await ent.save();
        } else {
            const total: number = entry.get("money") + Banking.randomNum(10, 25);
            entry.set({ money: total });
            await entry.save();
        }

        return this;
    }

    public minify(): Banking {
        // @ts-ignore
        const current: Banking = { ...this };
        delete current.guild;
        delete current.client;

        return current;
    }

    public async removeMoney(user, options: MoneyOptions): Promise<string | boolean> {
        if (user instanceof User || user instanceof GuildMember) { user = user.id; }
        if (user instanceof Message) { user = user.author.id; }

        const giveMember: FoxBank = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user,
        });
        if (!giveMember) { return "Account"; }
        const toUser: number = giveMember.get("money") - options.amount;
        if (toUser < 0) { return null; }
        giveMember.set({ money: toUser });
        await giveMember.save();

        return true;
    }

    public async set(key: string, value: any): Promise<Object> {
        const settings: FoxBank = await this.guild.client.mongo.banking.findOne({
            guildID: this.guild.id,
            type: "settings",
        });
        if (!settings) { return false; }
        if (!this.hasOwnProperty(key)) { return; }
        await settings.unset(key);
        await settings.set({ [key]: value });
        await settings.save();
        await this._loadSettings();

        return new Promise((r) => setTimeout(() => r(this.minify()), 50));
    }

}

import { User, GuildMember, Message } from "discord.js";
import { FoxGuild, FoxMessage } from "../extensions";
import { FoxClient } from "..";
import { FoxBank } from "../Mongo";

interface MoneyOptions {
    guild: FoxGuild;
    amount?: number;
}

export default class Banking {
    public guild: FoxGuild;
    public client: FoxClient;
    public shopItems: any[];
    public currency: string;
    public shopName: string;

    public constructor(guild: FoxGuild) {
        this.guild = guild;
        this.client = guild.client;
        this.shopItems = [];
        this.currency = "¥‎";
        this.shopName = "The Fox Store";
    }

    public async _loadSettings(): Promise<void> {
        const settings: FoxBank = await this.guild.client.mongo.banking.findOne({
            guildID: this.guild.id,
            type: "settings"
        });
        if (!settings) {
            const banking = new this.guild.client.mongo.banking({
                guildID: this.guild.id,
                type: "settings"
            });
            await banking.save();
        } else {
            for (const key of Object.keys(this)) {
                if (key === "guild" || key === "client") continue;
                const value = settings.get(key);
                if (value !== undefined) this[key] = value;
            }
        }
    }

    public minify(): Banking {
        // @ts-ignore
        const current = { ...this };
        delete current.guild;
        delete current.client;
        return current;
    }

    public async set(key: string, value: any): Promise<Object> {
        const settings: FoxBank = await this.guild.client.mongo.banking.findOne({
            guildID: this.guild.id,
            type: "settings"
        });
        if (!settings) return false;
        if (!this.hasOwnProperty(key)) return;
        await settings.unset(key);
        await settings.set({ [key]: value });
        await settings.save();
        await this._loadSettings();
        return new Promise(r => setTimeout(() => r(this.minify()), 50));
    }

    public async listen(message: FoxMessage) {
        if (!message.guild) return;
        if (!Banking.validate(message)) return;
        if (message.command) return;
        if (!message.guild.packages.get("Economy").enabled) return;

        const entry: FoxBank = await message.guild.client.mongo.banking.findOne({
            guildID: message.guild.id,
            userID: message.author.id
        });
        if (!entry) {
            const ent = new message.client.mongo.banking({
                guildID: message.guild.id,
                userID: message.author.id,
                money: 0,
                timeUntilDaily: Date.now()
            });
            await ent.save();
        } else {
            const total = entry.get("money") + Banking.randomNum(10, 25);
            entry.set({ money: total });
            await entry.save();
        }
    }

    public static randomNum(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public static validate(message: FoxMessage): boolean {
        const text = message.content.toLowerCase();
        const mentions = message.mentions;

        const substantialWords = [
            "js", "javascript", "node", "nodejs", "code", "pars", "script", "clojure", "sql",
            "discord", "moment", "snekfetch", "dithcord", "guide", "video", "bot", "dev", "git",
            "github", "discord.js", "snekie", "mod.banhammer", "mrfox", "rtexel", "jacz", "the", "this",
            "that", "hello"
        ].concat(Object.keys(process.binding("natives")));

        // Words that might indicate that this message is lower quality
        const insubstantialWords = ["lol", "lul", "lel", "kek", "xd", "¯\\_(ツ)_/¯", "dicksword", "gus", "kys", "dumbass",
            "!", "-", ".", message.guild.prefix];
        const necessarySubstance = 10;
        if (mentions.roles.some(r => [message.guild.id].includes(r.id))) return false;
        let substance = 0;
        if (text.length > "lol xD".length) (substance += 400) * ((substance - 5) / 1995) + 7; // tslint:disable-line
        substance += substantialWords.reduce((num, word) => text.includes(word) ? num + 2 : num, 0);
        substance -= insubstantialWords.reduce((num, word) => text.includes(word) ? num + 1 : num, 0);
        if (mentions.users.size > 0) substance -= mentions.users.size;
        else if (mentions.roles.size > 3) substance -= mentions.roles.size;
        else if (mentions.channels.size > 5) substance -= mentions.channels.size;
        else substance += 2;
        return substance >= necessarySubstance;
    }

    public async balanceOf(member: GuildMember): Promise<number> {
        const mem: FoxBank = await (member.guild as FoxGuild).client.mongo.banking.findOne({
            guildID: member.guild.id,
            userID: member.id
        });
        if (!mem) return NaN;
        return mem.get("money");
    }

    public async addMoney(user: any, options: MoneyOptions): Promise<boolean>{
        if (user instanceof User || user instanceof GuildMember) user = user.id;
        if (user instanceof Message) user = user.author.id;
        const giveMember: FoxBank = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user
        });
        if (!giveMember) return null;
        const toUser: number = giveMember.get("money") + options.amount;
        giveMember.set({ money: toUser });
        await giveMember.save();
        return true;
    }

    public async removeMoney(user, options: MoneyOptions): Promise<string|boolean> {
        if (user instanceof User || user instanceof GuildMember) user = user.id;
        if (user instanceof Message) user = user.author.id;

        const giveMember: FoxBank = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user
        });
        if (!giveMember) return "Account";
        const toUser: number = giveMember.get("money") - options.amount;
        if (toUser < 0) return null;
        giveMember.set({ money: toUser });
        await giveMember.save();
        return true;
    }

    public async giveDaily(user, options: MoneyOptions): Promise<number|boolean> {
        if (user instanceof User || user instanceof GuildMember) user = user.id;
        if (user instanceof Message) user = user.author.id;

        const entry: FoxBank = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user
        });
        if (!entry) return false;
        const time = entry.get("timeUntilDaily") - Date.now();
        if (entry.get("timeUntilDaily") >= Date.now()) return time;
        const toUser = entry.get("money") + 500;
        entry.set({
            money: toUser,
            timeUntilDaily: Date.now() + 86400000
        });
        await entry.save();
        return true;
    }

}

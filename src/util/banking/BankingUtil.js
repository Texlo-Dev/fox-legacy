import { User, GuildMember, Message } from 'discord.js';

export default class Banking {

    constructor(guild) {
        this.guild = guild;
        this.client = guild.client;
        this.shopItems = [];
        this.currency = '¥‎';
        this.shopName = 'The Fox Store';
    }

    async _loadSettings() {
        const settings = await this.guild.client.mongo.banking.findOne({
            guildID: this.guild.id,
            type: 'settings'
        });
        if (!settings) {
            const banking = new this.guild.client.mongo.banking({
                guildID: this.guild.id,
                type: 'settings'
            });
            await banking.save();
        } else {
            for (const key of Object.keys(this)) {
                if (key === 'guild' || key === 'client') continue;
                const value = settings.get(key);
                if (value !== undefined) this[key] = value;
            }
        }
    }

    minify() {
        const current = { ...this };
        delete current.guild;
        delete current.client;
        return current;
    }

    async set(key, value) {
        const settings = await this.guild.client.mongo.banking.findOne({
            guildID: this.guild.id,
            type: 'settings'
        });
        if (!settings) return false;
        if (!this.hasOwnProperty(key)) return;
        await settings.unset(key);
        await settings.set({ [key]: value });
        await settings.save();
        await this._loadSettings();
        return new Promise(r => setTimeout(() => r(this.minify()), 50));
    }

    async listen(message) {
        if (!message.guild) return;
        if (!Banking.validate(message)) return;
        if (message.command) return;
        if (!message.guild.packages.get('Economy').enabled) return;

        const entry = await message.guild.client.mongo.banking.findOne({
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
            const total = entry.get('money') + Banking.randomNum(10, 25);
            entry.set({ money: total });
            await entry.save();
        }
    }

    static randomNum(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static validate(message) {
        const text = message.content.toLowerCase();
        const mentions = message.mentions;

        const substantialWords = [
            'js', 'javascript', 'node', 'nodejs', 'code', 'pars', 'script', 'clojure', 'sql',
            'discord', 'moment', 'snekfetch', 'dithcord', 'guide', 'video', 'bot', 'dev', 'git',
            'github', 'discord.js', 'snekie', 'mod.banhammer', 'mrfox', 'rtexel', 'jacz', 'the', 'this',
            'that', 'hello'
        ].concat(Object.keys(process.binding('natives')));

        // Words that might indicate that this message is lower quality
        const insubstantialWords = ['lol', 'lul', 'lel', 'kek', 'xd', '¯\\_(ツ)_/¯', 'dicksword', 'gus', 'kys', 'dumbass',
            '!', '-', '.', message.guild.prefix];
        const necessarySubstance = 10;
        if (mentions.roles.some(r => [message.guild.id].includes(r.id))) return false;
        let substance = 0;
        if (text.length > 'lol xD'.length) (substance += 400) * ((substance - 5) / 1995) + 7; // eslint-disable-line
        substance += substantialWords.reduce((num, word) => text.includes(word) ? num + 2 : num, 0);
        substance -= insubstantialWords.reduce((num, word) => text.includes(word) ? num + 1 : num, 0);
        if (mentions.users.size > 0) substance -= mentions.users.size;
        else if (mentions.roles.size > 3) substance -= mentions.roles.size;
        else if (mentions.channels.size > 5) substance -= mentions.channels.size;
        else substance += 2;
        return substance >= necessarySubstance;
    }

    async balanceOf(member) {
        const mem = await member.guild.client.mongo.banking.findOne({
            guildID: member.guild.id,
            userID: member.id
        });
        if (!mem) return NaN;
        return mem.get('money');
    }

    async addMoney(user, options = {}) {
        if (user instanceof User || user instanceof GuildMember) user = user.id;
        if (user instanceof Message) user = user.author.id;
        const giveMember = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user
        });
        if (!giveMember) return null;
        const toUser = giveMember.get('money') + options.amount;
        giveMember.set({ money: toUser });
        await giveMember.save();
        return true;
    }

    async removeMoney(user, options = {}) {
        if (user instanceof User || user instanceof GuildMember) user = user.id;
        if (user instanceof Message) user = user.author.id;

        const giveMember = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user
        });
        if (!giveMember) return 'Account';
        const toUser = giveMember.get('money') - options.amount;
        if (toUser < 0) return null;
        giveMember.set({ money: toUser });
        await giveMember.save();
        return true;
    }


    async giveDaily(user, options = {}) {
        if (user instanceof User || user instanceof GuildMember) user = user.id;
        if (user instanceof Message) user = user.author.id;

        const entry = await options.guild.client.mongo.banking.findOne({
            guildID: options.guild.id,
            userID: user
        });
        if (!entry) return false;
        const time = entry.get('timeUntilDaily') - Date.now();
        if (entry.get('timeUntilDaily') >= Date.now()) return time;
        const toUser = entry.get('money') + 500;
        entry.set({
            money: toUser,
            timeUntilDaily: Date.now() + 86400000
        });
        await entry.save();
        return true;
    }


}

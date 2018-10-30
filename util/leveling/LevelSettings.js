import LevelMigrate from './migrator';

export default class Leveling {

    constructor(guild) {
        this.guild = guild;
        this.promoRoles = [];
        this.messageLocation = 'Current Channel';
        this.stackRoles = true;
        this.excludedChannels = [];
        this.excludedRoles = [];
    }

    async _loadSettings() {
        const settings = await this.guild.client.mongo.leveling.findOne({
            guildID: this.guild.id,
            type: 'settings'
        });
        if (!settings) {
            const levelsettings = new this.guild.client.mongo.leveling({
                guildID: this.guild.id,
                type: 'settings'
            });
            await levelsettings.save();
        } else {
            for (const key of Object.keys(this)) {
                if (key === 'guild') continue;
                const value = settings.get(key);
                if (value === undefined) continue;
                this[key] = value;
            }
        }
    }

    minify() {
        const current = { ...this };
        delete current.guild;
        return current;
    }
    async set(key, value) {
        const settings = await this.guild.client.mongo.leveling.findOne({
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
        if (message.content.startsWith(message.guild.config.prefix)) return;
        if (!message.guild.packages.get('Leveling').enabled) return;
        if (!Leveling.validate(message)) return;
        const isEligible = Leveling.checkEligibility(message.member, message.channel);
        if (!isEligible) return;
        await LevelMigrate(message);
        await this._loadSettings();

        const memberdata = await this.guild.client.mongo.leveling.findOne({ guildID: message.guild.id, userID: message.author.id });
        if (memberdata) {
            const level = memberdata.get('level');
            const calculatedXp = Leveling.generateXp(level);
            memberdata.set({ xp: memberdata.get('xp') + calculatedXp, totalXP: memberdata.get('totalXP') + calculatedXp });
            await memberdata.save();
            if (memberdata.get('xp') >= memberdata.get('tonextlevel')) {
                memberdata.set({
                    xp: 0,
                    level: memberdata.get('level') + 1,
                    tonextlevel: Math.round(memberdata.get('tonextlevel') * 1.19)
                });
                await memberdata.save();
                message.client.emit('levelUp', message, memberdata.get('level'));
            }
        } else {
            const entry = new this.guild.client.mongo.leveling({
                guildID: message.guild.id,
                userID: message.author.id,
                level: 1,
                xp: 0,
                totalXP: 0,
                tonextlevel: 100
            });
            await entry.save();
        }
    }

    async rankOf(member) {
        const data = await member.client.mongo.leveling.sort('totalXP', 'desc').find({ guildID: member.guild.id });
        var mapped = data.map(c => `${c.get('userID')}`);
        return mapped.indexOf(member.id) + 1;
    }

    async levelOf(member) {
        const entry = await member.client.mongo.leveling.findOne({
            guildID: member.guild.id,
            userID: member.id
        });
        if (!entry) return null;
        return entry.get('level');
    }

    static generateXp(level) {
        if (level >= 60) return level * 20;
        if (level >= 35) return level * 10;
        else if (level >= 27) return Leveling.randomNum(110, 115);
        else return Leveling.randomNum(10, 15);
    }

    static randomNum(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }


    static checkEligibility(member, channel) {
        const excludedRoles = member.guild.leveling.excludedRoles;
        const excludedChannels = member.guild.leveling.excludedChannels;
        if (excludedRoles.length && excludedRoles.some(role => member.roles.has(role.id))) return null;
        else if (excludedChannels.length && excludedChannels.some(c => c.id === channel.id)) return null;
        return true;
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


}


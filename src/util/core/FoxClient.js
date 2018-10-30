import { Client, Collection } from 'discord.js';
import {
    CommandStore,
    FoxMusic,
    EventStore,
    Tools,
    Loader
} from '../';
import translate from 'translate';
import { prefix, isTestFox, ownerID, devs, dbotsKey, yt_api_key as googleKey } from '../../config.json';
import { post, get } from 'snekfetch';
import { Database, Model } from 'mongorito';
import { request } from 'axios';
translate.key = googleKey;
const connection = new Database('localhost/encipio');
connection.connect().then(() => console.log('MongoDB connection established.')).catch(err => {
    console.error(`Error connecting to MongoDB. ${err}`);
    process.exit();
});
class FoxLeveling extends Model {}
class customcommands extends Model {}
class modActions extends Model {}
class guildSettings extends Model {}
class tags extends Model {}
class FoxBank extends Model {}
class polls extends Model {}
class patrons extends Model {}
class selfroles extends Model {}
class permissions extends Model {}
class giveaways extends Model {}
connection.register(guildSettings);
connection.register(FoxLeveling);
connection.register(modActions);
connection.register(customcommands);
connection.register(tags);
connection.register(FoxBank);
connection.register(selfroles);
connection.register(polls);
connection.register(patrons);
connection.register(permissions);
connection.register(giveaways);


Array.prototype.shuffle = function ArrayShuffle() {
    for (var i = this.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = this[randomIndex];

        this[randomIndex] = this[i];
        this[i] = itemAtIndex;
    }
    return this;
};

class FoxClient extends Client {

    constructor() {
        super({ disableEveryone: true });
        this.tools = Tools;
        this.packages = [];
        this.music = new FoxMusic(this);
        this.commandPrefix = prefix;
        this.commands = new CommandStore(this);
        this.events = new EventStore();
        this.commandsRun = 0;
        this.isTestFox = isTestFox;
        this.permissions = new Collection();
        this.brandColor = 0x242424;
        this.ready = false;
        this.translate = translate;
        this.locales = {
            French: 'fr',
            English: 'en',
            Spanish: 'es',
            Greek: 'gre',
            Portuguese: 'por',
            Swahili: 'swa',
            Dutch: 'dut',
            Lithuanian: 'lt',
            German: 'ger',
            Vietnamese: 'vi',
            Swedish: 'sw',
            Russian: 'ru',
            Japanese: 'ja',
            Italian: 'it'
        };
        this.mongo = { customcommands, leveling: FoxLeveling, modactions: modActions, banking: FoxBank, tags, selfroles, permissions, giveaways, guildconfig: guildSettings, polls, patrons };
        this.once('ready', async () => this._ready());
    }

    isOwner(id) {
        return id === ownerID;
    }
    isDev(id) {
        return this.isOwner(id) || devs.includes(id);
    }

    clean(text) {
        return text
            .replace(/`/g, `\`${String.fromCharCode(8203)}`)
            .replace(/@/g, `@${String.fromCharCode(8203)}`)
            .replace(new RegExp(`${this.token}`, 'g'), 'NO YOU');
    }

    paginate(items, page = 1, pageLength = 10) {
        const maxPage = Math.ceil(items.length / pageLength);
        if (page < 1) page = 1;
        if (page > maxPage) page = maxPage;
        const startIndex = (page - 1) * pageLength;
        return {
            items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
            page,
            maxPage,
            pageLength
        };
    }

    async haste(input, extension) {
        return new Promise(async (res, rej) => {
            if (!input) return rej('Input argument is required.');
            const { body: { key } } = await post('https://hastebin.com/documents').send(input).catch(e => rej(e));
            res(`https://hastebin.com/${key}${extension ? `.${extension}` : ''}`);
        });
    }

    async axios(method, meta) {
        if (!method || !meta) throw new Error('Missing Paramaters.');
        return request({
            method,
            url: meta.url,
            data: meta.body || {},
            headers: meta.headers || {},
            query: meta.query || {}
        }).then(res => res.data);
    }

    capitalizeStr(string) {
        return string.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    sweepMessages(lifetime = this.options.messageCacheLifetime, commandLifetime = 30000) {
        if (typeof lifetime !== 'number' || isNaN(lifetime)) throw new TypeError('The lifetime must be a number.');
        if (lifetime <= 0) {
            this.emit('debug', 'Didn\'t sweep messages - lifetime is unlimited');
            return -1;
        }

        const lifetimeMs = lifetime * 1000;
        const commandLifetimeMs = commandLifetime * 1000;
        const now = Date.now();
        let channels = 0;
        let messages = 0;
        let commandMessages = 0;

        for (const channel of this.channels.values()) {
            if (!channel.messages) continue;
            channels++;

            for (const message of channel.messages.values()) {
                if (message.command && now - (message.editedTimestamp || message.createdTimestamp) > commandLifetimeMs) {
                    channel.messages.delete(message.id);
                    commandMessages++;
                } else if (!message.command && now - (message.editedTimestamp || message.createdTimestamp) > lifetimeMs) {
                    channel.messages.delete(message.id);
                    messages++;
                }
            }
        }

        this.emit('debug', `Swept ${messages} messages older than ${lifetime} seconds and ${commandMessages} command messages older than ${commandLifetime} seconds in ${channels} text-based channels`);
        return messages;
    }

    isUpvoter(id) {
        if (this.user.id !== '333985343445663749') return Promise.resolve(true);
        return new Promise(async (res, rej) => {
            get(`https://discordbots.org/api/bots/333985343445663749/votes`)
                .set('Authorization', dbotsKey)
                .then(r => res(r.body.map(c => c.id).includes(id)))
                .catch(err => rej(err));
        });
    }


    spanMs(span) {
        if (typeof span !== 'string') return null;
        let total = 0;
        const amounts = span.split(/[a-z]/); amounts.splice(-1);
        const units = span.split(/\d+/); units.shift();
        for (let i = 0; i < units.length; i++) {
            amounts[i] = parseFloat(amounts[i]);
            let mult = 0;
            switch (units[i]) {
            case 'w' :
                mult = 604800000; break;
            case 'd':
                mult = 86400000; break;
            case 'h':
                mult = 3600000; break;
            case 'm':
                mult = 60000; break;
            case 's':
                mult = 1000; break;
            default:
                mult = null; break;
            }
            total += mult * amounts[i];
        }
        return total;
    }

    get args() {
        const obj = {
            member: `mention, ID, or name (Ex: @Jacz#9536, Jacz)`,
            duration: `second, minute, hour, day, week (Ex: 2s, 4m, 8d, 9w)`,
            reason: `string`,
            number: 'number (Ex: 50)'
        };
        return obj;
    }

    async _ready() {
        const { loadCommands, loadEvents } = Loader;
        await loadCommands(this);
        await loadEvents(this);
        this.ready = true;
        this.emit('foxReady');
    }

}

export default FoxClient;

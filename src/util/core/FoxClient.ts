import { Client, Collection, MessageStore, TextChannel } from "discord.js";
import {
    CommandStore,
    FoxMusic,
    EventStore,
    Tools,
    Loader
} from "..";
import translate from "translate";
import { prefix, isTestFox, ownerID, devs, dbotsKey, googleAPI } from "../../config.json";
import * as Mongo from "../Mongo";
import axios, { AxiosResponse } from "axios";
import { FoxMessage } from "../extensions";
translate.key = googleAPI;

class FoxClient extends Client {
    public tools: typeof Tools;
    public packages: string[];
    public music: FoxMusic;
    public commandPrefix: string;
    public commands: CommandStore;
    public events: EventStore;
    public commandsRun: number;
    public isTestFox: boolean;
    public ready: boolean;
    public translate: Function;
    public locales: any;
    public permissions: any;
    public mongo: any;
    public brandColor: number;

    public constructor() {
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
            French: "fr",
            English: "en",
            Spanish: "es",
            Greek: "gre",
            Portuguese: "por",
            Swahili: "swa",
            Dutch: "dut",
            Lithuanian: "lt",
            German: "ger",
            Vietnamese: "vi",
            Swedish: "sw",
            Russian: "ru",
            Japanese: "ja",
            Italian: "it"
        };
        this.mongo = {
            customcommands: Mongo.CustomCommands,
            leveling: Mongo.FoxLeveling,
            modactions: Mongo.ModActions,
            banking: Mongo.FoxBank,
            tags: Mongo.Tags,
            selfroles: Mongo.SelfRoles,
            permissions: Mongo.Permissions,
            giveaways: Mongo.Giveaways,
            guildconfig: Mongo.GuildSettings,
            polls: Mongo.Polls,
            patrons: Mongo.Patrons
        };
        this.once("ready", async () => this._ready());
    }

    public isOwner(id: string): boolean {
        return id === ownerID;
    }
    public isDev(id: string): boolean {
        return this.isOwner(id) || devs.includes(id);
    }

    public clean(text: string): string {
        return text
            .replace(/`/g, `\`${String.fromCharCode(8203)}`)
            .replace(/@/g, `@${String.fromCharCode(8203)}`)
            .replace(new RegExp(`${this.token}`, "g"), "NO YOU");
    }

    public paginate(items: any[], page = 1, pageLength = 10): any {
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

    public async haste(input: string, extension: string): Promise<String> {
        return axios({
            url: "https://hastebin.com/documents",
            data: input
        }).then(res => `https://hastebin.com/${res.data.key}${extension ? `.${extension}` : ""}`)
        .catch(err => err);
    }

    public async http(method: string, meta: any): Promise<AxiosResponse> {
        if (!method || !meta) throw new Error("Missing Paramaters.");
        return axios({
            method,
            url: meta.url,
            data: meta.body || {},
            headers: meta.headers || {}
        }).then(res => res.data);
    }

    public capitalizeStr(string: string): string {
        return string.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    public sweepMessages(lifetime = this.options.messageCacheLifetime, commandLifetime = 30000): number | MessageStore {
        if (typeof lifetime !== "number" || isNaN(lifetime)) throw new TypeError("The lifetime must be a number.");
        if (lifetime <= 0) {
            this.emit("debug", "Didn't sweep messages - lifetime is unlimited");
            return -1;
        }

        const lifetimeMs = lifetime * 1000;
        const commandLifetimeMs = commandLifetime * 1000;
        const now = Date.now();
        let channels = 0;
        let messages = 0;
        let commandMessages = 0;

        for (let channel of this.channels.values()) {
            let chl = channel as TextChannel;

            if (!chl.messages) continue;
            channels++;

            for (const message of chl.messages.values()) {
                let mess = message as FoxMessage;
                if (mess.command && now - (mess.editedTimestamp || mess.createdTimestamp) > commandLifetimeMs) {
                    chl.messages.delete(message.id);
                    commandMessages++;
                } else if (!mess.command && now - (mess.editedTimestamp || mess.createdTimestamp) > lifetimeMs) {
                    chl.messages.delete(message.id);
                    messages++;
                }
            }
        }

        this.emit("debug", `Swept ${messages} messages older than ${lifetime} seconds and ${commandMessages} command messages older than ${commandLifetime} seconds in ${channels} text-based channels`);
        return messages;
    }

    public async isUpvoter(id: string): Promise<boolean> {
        if (this.user.id !== "333985343445663749") return Promise.resolve(true);
        const res = await axios({
            url: `https://discordbots.org/api/bots/333985343445663749/votes`,
            headers: {
                Authorization: dbotsKey
            }
        });
        return res.data.map((c: any) => c.id).includes(id);
    }

    public spanMs(span: string): number {
        if (typeof span !== "string") return null;
        let total = 0;
        const amounts: any = span.split(/[a-z]/); amounts.splice(-1);
        const units = span.split(/\d+/); units.shift();
        for (let i = 0; i < units.length; i++) {
            amounts[i] = parseFloat(amounts[i]);
            let mult = 0;
            switch (units[i]) {
            case "w" :
                mult = 604800000; break;
            case "d":
                mult = 86400000; break;
            case "h":
                mult = 3600000; break;
            case "m":
                mult = 60000; break;
            case "s":
                mult = 1000; break;
            default:
                mult = null; break;
            }
            total += mult * amounts[i];
        }
        return total;
    }

    public get args(): object {
        const obj: object = {
            member: `mention, ID, or name (Ex: @Jacz#9536, Jacz)`,
            duration: `second, minute, hour, day, week (Ex: 2s, 4m, 8d, 9w)`,
            reason: `string`,
            number: "number (Ex: 50)"
        };
        return obj;
    }

    public async _ready(): Promise<void> {
        const { loadCommands, loadEvents } = Loader;
        await loadCommands(this);
        await loadEvents(this);
        this.ready = true;
        this.emit("foxReady");
    }

    public shuffleArray(arr: any[]): any[] {
        let i = arr.length, j, temp;
        if ( i === 0 ) return arr;
        while ( --i ) {
            j = Math.floor( Math.random() * ( i + 1 ) );
            temp = arr[i];
            arr[i] = arr[j];
        arr[j] = temp;
        }
        return arr;
    }
}

export default FoxClient;

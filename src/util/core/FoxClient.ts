// tslint:disable:no-parameter-reassignment no-magic-numbers interface-name
import translate from "@k3rn31p4nic/google-translate-api";
import axios, { AxiosResponse } from "axios";
import { Client, Collection, TextChannel, Util } from "discord.js";
import { Node } from "lavalink";
import { CommandStore, EventStore, FoxMusic, Loader, Tools } from "..";
import {
  dboatsKey,
  dbotsKey,
  devs,
  isTestFox,
  lavalinkpass,
  ownerID,
  prefix
} from "../../config.json";
import { FoxMessage } from "../extensions";
import * as Mongo from "../Mongo";
const THRESHOLD: number = 1000 * 60 * 20;
const EPOCH: number = 1420070400000;
const EMPTY: string = "0000100000000000000000";

interface ClientArguments {
  duration: string;
  member: string;
  number: string;
  reason: string;
}

class FoxClient extends Client {
  public get args(): ClientArguments {
    return {
      member: "mention, ID, or name (Ex: @Jacz#9536, Jacz)",
      duration: "second, minute, hour, day, week (Ex: 2s, 4m, 8d, 9w)",
      reason: "string",
      number: "number (Ex: 50)"
    };
  }

  public static async haste(input: string, extension: string): Promise<string> {
    return this.http("POST", {
      url: "https://hastebin.com/documents",
      body: input
    })
      .then(
        res =>
          `https://hastebin.com/${res.key}${extension ? `.${extension}` : ""}`
      )
      .catch(err => err);
  }

  // tslint:disable-next-line:member-ordering
  public static async http(method: string, meta: any): Promise<AxiosResponse> {
    if (!method || !meta) {
      throw new Error("Missing Paramaters.");
    }

    return axios({
      method,
      url: meta.url,
      data: meta.body || {},
      headers: meta.headers || {}
    })
      .then(res => res.data)
      .catch(err => Promise.reject(err));
  }
  public static isDev(id: string): boolean {
    return this.isOwner(id) || devs.includes(id);
  }

  public static isOwner(id: string): boolean {
    return id === ownerID;
  }

  public static paginate(
    items: any[],
    page: number = 1,
    pageLength: number = 10
  ): any {
    const maxPage: number = Math.ceil(items.length / pageLength);
    if (page < 1) {
      page = 1;
    }
    if (page > maxPage) {
      page = maxPage;
    }
    const startIndex: number = (page - 1) * pageLength;

    return {
      items:
        items.length > pageLength
          ? items.slice(startIndex, startIndex + pageLength)
          : items,
      page,
      maxPage,
      pageLength
    };
  }

  public static shuffleArray(arr: any[]): any[] {
    let i: number = arr.length,
      j,
      temp; // tslint:disable-line
    if (i === 0) {
      return arr;
    }
    while (--i) {
      j = Math.floor(Math.random() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    return arr;
  }

  public static spanMs(span: string): number {
    if (typeof span !== "string") {
      return undefined;
    }
    let total: number = 0;
    const amounts: any = span.split(/[a-z]/);
    amounts.splice(-1);
    const units: string[] = span.split(/\d+/);
    units.shift();
    for (let i: number = 0; i < units.length; i++) {
      amounts[i] = parseFloat(amounts[i]);
      let mult: number = 0;
      switch (units[i]) {
        case "w":
          mult = 604800000;
          break;
        case "d":
          mult = 86400000;
          break;
        case "h":
          mult = 3600000;
          break;
        case "m":
          mult = 60000;
          break;
        case "s":
          mult = 1000;
          break;
        default:
          mult = undefined;
      }
      total += mult * amounts[i];
    }

    return total;
  }
  public brandColor: number;
  public commandPrefix: string;
  public commands: CommandStore;
  public commandsRun: number;
  public events: EventStore;
  public isTestFox: boolean;
  public locales: any;
  public mongo: any;
  public music: Node;
  public packages: string[];
  public permissions: any;
  public ready: boolean;
  public tools: typeof Tools;
  public translate: Function;

  public constructor(options = {}) {
    super({
      disableEveryone: true,
      disabledEvents: [
        "TYPING_START",
        "TYPING_STOP",
        "GUILD_SYNC",
        "RELATIONSHIP_ADD",
        "RELATIONSHIP_REMOVE",
        "USER_SETTINGS_UPDATE",
        "USER_NOTE_UPDATE",
        "VOICE_SERVER_UPDATE"
      ],
      ...options
    });
    this.tools = Tools;
    this.packages = [];
    this.commandPrefix = prefix;
    this.commands = new CommandStore(this);
    this.events = new EventStore();
    this.commandsRun = 0;
    this.isTestFox = isTestFox;
    this.permissions = new Collection();
    this.brandColor = 0xe76d27;
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
      tickets: Mongo.Tickets,
      selfroles: Mongo.SelfRoles,
      permissions: Mongo.Permissions,
      giveaways: Mongo.Giveaways,
      guildconfig: Mongo.GuildSettings,
      polls: Mongo.Polls,
      patrons: Mongo.Patrons
    };

    this.once("ready", async () => this._ready());
  }

  public async _ready(): Promise<void> {
    const { loadCommands, loadEvents } = Loader;
    await loadCommands(this);
    await loadEvents(this);
    this.music = new Node({
      userID: this.user.id,
      password: lavalinkpass,
      shardCount: this.options.totalShardCount,
      hosts: {
        rest: "http://localhost:2333",
        ws: "ws://localhost:2333"
      },
      send: (guildID: string, packet: any): void => {
        const guild: Guild = this.guilds.get(guildID);
        if (guild) return this.ws.shards.get(guild.shardID).send(packet);

        return undefined;
      }
    }).on(
      "playerUpdate",
      ({ guildId, state: { position } }) => (this.music.players.get(guildId).position = position)
    );
    this.ready = true;
    this.emit("foxReady");
  }

  public capitalizeStr(string: string): string {
    return string.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  public clean(text: string): string {
    return text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(new RegExp(`${this.token}`, "g"), "NO YOU");
  }

  public async isUpvoter(id: string): Promise<boolean> {
    if (this.user.id !== "333985343445663749") {
      return Promise.resolve(true);
    }
    const res: AxiosResponse = await axios({
      url: "https://discordbots.org/api/bots/333985343445663749/votes",
      headers: {
        Authorization: dbotsKey
      }
    });

    return res.data.map((c: any) => c.id).includes(id);
  }

  public memorySweep(): void {
    const OLD_SNOWFLAKE: string = Util.binaryToID(
      (Date.now() - THRESHOLD - EPOCH).toString(2).padStart(42, "0") + EMPTY
    );
    let presences: number = 0;
    let guildMembers: number = 0;
    let emojis: number = 0;
    let messages: number = 0;
    let users: number = 0;

    // Per-Guild sweeper
    for (const guild of this.guilds.values()) {
      // Clear presences
      presences += guild.presences.size;
      guild.presences.clear();

      // Clear members that haven't send a message in the last 30 minutes
      const { me } = guild;
      for (const [id, member] of guild.members) {
        if (member === me) continue;
        if (member.voice) continue;
        if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE)
          continue;
        guildMembers++;
        guild.members.delete(id);
      }

      // Clear emojis
      emojis += guild.emojis.size;
      guild.emojis.clear();
    }

    // Per-Channel sweeper
    for (const channel of this.channels.values()) {
      if (!channel.messages) continue;
      messages += channel.messages.sweep(msg => msg.id < OLD_SNOWFLAKE);
      channel.lastMessageID = null;
    }

    // Per-User sweeper
    for (const user of this.users.values()) {
      if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
      this.users.delete(user.id);
      users++;
    }
  }

  public async postStats(): Promise<void> {
    const servercount: any[] = await this.shard.fetchClientValues(
      "guilds.size"
    );
    for (const [shard, count] of servercount.entries()) {
      FoxClient.http("POST", {
        url: `https://discordbots.org/api/bots/${this.user.id}/stats`,
        body: {
          shard_id: shard,
          shard_count: this.options.totalShardCount,
          server_count: count
        },
        headers: { Authorization: dbotsKey }
      }).catch(console.error);

      FoxClient.http("POST", {
        url: `https://discord.boats/api/bot/${this.user.id}`,
        body: {
          server_count: servercount.reduce((prev, val) => prev + val, 0)
        },
        headers: { Authorization: dboatsKey }
      }).catch(console.error);
    }
  }

  public sweepMessages(
    lifetime: number = this.options.messageCacheLifetime,
    commandLifetime: number = 30000
  ): number {
    // tslint:disable-line
    if (typeof lifetime !== "number" || isNaN(lifetime)) {
      throw new TypeError("The lifetime must be a number.");
    }
    if (lifetime <= 0) {
      this.emit("debug", "Didn't sweep messages - lifetime is unlimited");

      return -1;
    }

    const lifetimeMs: number = lifetime * 1000;
    const commandLifetimeMs: number = commandLifetime * 1000;
    const now: number = Date.now();
    let channels: number = 0;
    let messages: number = 0;
    let commandMessages: number = 0;

    for (const channel of this.channels.values()) {
      const chl: TextChannel = channel as TextChannel;

      if (!chl.messages) {
        continue;
      }
      channels++;

      for (const message of chl.messages.values()) {
        const mess: FoxMessage = message as FoxMessage;
        if (
          mess.command &&
          now - (mess.editedTimestamp || mess.createdTimestamp) >
            commandLifetimeMs
        ) {
          chl.messages.delete(message.id);
          commandMessages++;
        } else if (
          !mess.command &&
          now - (mess.editedTimestamp || mess.createdTimestamp) > lifetimeMs
        ) {
          chl.messages.delete(message.id);
          messages++;
        }
      }
    }
    this.emit(
      "debug",
      `Swept ${messages} messages older than ${lifetime} seconds and ${commandMessages} command messages older than ${commandLifetime} seconds in ${channels} text-based channels`
    ); // tslint:disable-line

    return messages;
  }
}

export default FoxClient;

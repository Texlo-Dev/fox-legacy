// tslint:disable:interface-name
import {
  Collection,
  CollectorFilter,
  Guild,
  Message,
  MessageOptions,
  TextChannel,
  User
} from "discord.js";
import {
  Banking,
  Command,
  Config,
  CustomCommands,
  FoxClient,
  FoxPermission,
  GiveawayStore,
  Leveling,
  Package,
  PermStore,
  PollStore as Polls,
  ServerProtect,
  TicketStore
} from "..";

// @ts-ignore
export interface FoxGuild extends Guild {
  banking: Banking;
  client: FoxClient;
  commands: CustomCommands;
  config: Config;
  fetchPackages: Function;
  giveaways: GiveawayStore;
  leveling: Leveling;
  packages: Collection<any, Package>;
  permissions: Collection<any, FoxPermission>;
  perms: PermStore;
  polls: Polls;
  queue: any;
  serverprotect: ServerProtect;
  shard: number;
  tickets: TicketStore;
}

// @ts-ignore
export interface FoxMessage extends Message {
  _registerCommand: Function;
  author: FoxUser;
  channel: TextChannel;
  client: FoxClient;
  command: Command;
  guild: FoxGuild;
  responses: any;
  error(content: string, options?: MessageOptions): Promise<FoxMessage>;
  FoxEmbed(options: any, text: string): Promise<FoxMessage>;
  send(content: any, options?: MessageOptions): Promise<FoxMessage>;
  sendPrompt(
    prompt: string,
    time: number,
    filter?: CollectorFilter
  ): Promise<number | string>;
  success(content: string, options?: MessageOptions): Promise<FoxMessage>;
}

export interface FoxUser extends User {
  patreonTier: number;
  upvoter: boolean;
  _setTier(): Promise<number>;
  _setUpvoter(): Promise<boolean>;
  addPatreon(tier: number): Promise<boolean>;
  removePatreon(): Promise<boolean>;
}

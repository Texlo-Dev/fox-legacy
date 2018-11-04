import { Guild, Message, User, Collection } from "discord.js";
import {
    Banking,
    CustomCommands,
    Leveling,
    PollStore as Polls,
    FoxPermission,
    Package,
    GiveawayStore,
    Config,
    ServerProtect,
    PermStore,
    FoxClient,
    Command
} from "..";

export interface FoxGuild extends Guild {
    perms: PermStore;
    config: Config;
    shard: number;
    polls: Polls;
    giveaways: GiveawayStore;
    serverprotect: ServerProtect;
    queue: any;
    leveling: Leveling;
    permissions: Collection<any, FoxPermission>;
    banking: Banking;
    packages: Collection<any, Package>;
    commands: CustomCommands;
    fetchPackages: Function;
    // @ts-ignore
    client: FoxClient;
}

// @ts-ignore
export interface FoxMessage extends Message {
    command: Command;
    client: FoxClient;
    guild: FoxGuild;
    responses: any;
    FoxEmbed: Function;
    error: Function;
    success: Function;
    _registerCommand: Function;
    send: Function;
    sendPrompt: Function;
}

export interface FoxUser extends User {
    upvoter: boolean;
    patreonTier: number;
    _setTier: Function;
    _setUpvoter: Function;
}

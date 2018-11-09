import { Guild, GuildMember, Message, StringResolvable, User } from "discord.js";

export interface Options {
    client?: FoxClient;
    description: string;
    enabled?: boolean;
    name: string;
}

export interface CustOptions {
    args?: any;
    category: string;
    cooldown: number;
    deleteCommand: boolean;
    description: string;
    dmCommand: boolean;
    enabled: boolean;
    guildID: string;
    name: string;
    requiredPerms: string;
    template: string;
    usage: string;
}

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
} from "../util";

export interface FoxConfig {
    aiKey: string;
    clientID: string;
    clientSecret: string;
    darkSkyAPI: string;
    dboatsKey: string;
    dbotsKey: string;
    devs: string[];
    discordbotsKey: string;
    gitName: string;
    gitPass: string;
    googleAPI: string;
    isTestFox: boolean;
    ownerID: string;
    prefix: string;
    scKey: string;
    token: string;
}

export interface CommandInfo {
    aliases?: string[];
    cooldown?: number;
    description: string;
    enabled?: boolean;
    extendedUsage?: any;
    guildOnly?: boolean;
    name: string;
    patreonTier?: number;
    requiredPerms?: string[];
    usage?: string;
}

import { User, Message, Guild, GuildMember, StringResolvable } from "discord.js";

export interface Options {
    name: string;
    description: string;
    client?: FoxClient;
    enabled?: boolean;
}

export interface CustOptions {
    name: string;
    guildID: string;
    description: string;
    enabled: boolean;
    category: string;
    cooldown: number;
    dmCommand: boolean;
    deleteCommand: boolean;
    requiredPerms: string;
    args: any;
    usage: string;
    template: string;
}

import {
    Command,
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
    FoxClient
} from "../util";

export type FoxConfig = {
    token: string;
    clientSecret: string;
    isTestFox: boolean;
    clientID: string;
    prefix: string;
    googleAPI: string;
    devs: string[];
    ownerID: string;
    aiKey: string;
    scKey: string;
    gitPass: string;
    darkSkyAPI: string;
    gitName: string;
    dboatsKey: string;
    dbotsKey: string;
    discordbotsKey: string;
};

export interface CommandInfo {
    name: string;
    description: string;
    aliases?: string[];
    usage?: string;
    cooldown?: number;
    extendedUsage?: string[];
    requiredPerms?: string[];
    guildOnly?: boolean;
    patreonTier?: number;
    enabled?: boolean;
}

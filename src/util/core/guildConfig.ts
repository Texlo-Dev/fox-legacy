import { FoxGuild } from "../extensions";
import { GuildSettings } from "../Mongo";
export default class GuildConfig {
    public readonly allowedBwChannels: any[];
    public readonly allowedCapsChannels: any[];
    public readonly allowedInviteChannels: any[];
    public readonly allowedMentionChannels: any[];
    public readonly allowedSpamChannels: any[];
    public autoRoles: any[];
    public badWords: string[];
    public readonly banPoints: number;
    public readonly bwProtected: boolean;
    public readonly delModCmds: boolean;
    public disabledCommands: string[];
    public enabledEvents: string[];
    public readonly goodbyeChannel: any;
    public readonly goodbyeEmbed: boolean;
    public readonly goodbyeEnabled: boolean;
    public readonly goodbyeMsg: string;
    public readonly guild: FoxGuild;
    public readonly invProtected: boolean;
    public readonly kickPoints: number;
    public language: string;
    public readonly levelMessaging: boolean;
    public readonly levelMsg: string;
    public readonly logExcluded: any[];
    public readonly massProtected: boolean;
    public readonly mentionLimit: number;
    public readonly messageLogging: boolean;
    public readonly modlogChannel: any;
    public readonly modLogging: boolean;
    public readonly msgAfterMod: boolean;
    public readonly muteRole: any;
    public readonly packages: string[];
    public readonly prefix: string;
    public reactionRoles: any[];
    public selfRoles: any[];
    public readonly serverlogChannel: any;
    public readonly serverLogging: boolean;
    public readonly spamProtected: boolean;
    public readonly tacMode: boolean;
    public readonly welcomeChannel: any;
    public readonly welcomeEnabled: boolean;
    public readonly welcomeLocation: any;
    public readonly welcomeMsg: string;
    public readonly welcomerEmbed: boolean;

    public constructor(guild: FoxGuild) {
        this.guild = guild;
        this.prefix = guild.client.commandPrefix;
        this.modlogChannel = undefined;
        this.serverlogChannel = undefined;
        this.welcomeEnabled = undefined;
        this.welcomeMsg = undefined;
        this.welcomerEmbed = undefined;
        this.welcomeLocation = undefined;
        this.goodbyeEnabled = undefined;
        this.goodbyeChannel = undefined;
        this.goodbyeEmbed = undefined;
        this.goodbyeMsg = undefined;
        this.levelMsg = undefined;
        this.packages = [];
        this.kickPoints = undefined;
        this.banPoints = undefined;
        this.muteRole = undefined;
        this.delModCmds = undefined;
        this.msgAfterMod = undefined;
        this.tacMode = undefined;
        this.mentionLimit = undefined;
        this.messageLogging = undefined;
        this.modLogging = undefined;
        this.massProtected = undefined;
        this.serverLogging = undefined;
        this.levelMessaging = undefined;
        this.invProtected = undefined;
        this.language = "English";
        this.bwProtected = undefined;
        this.badWords = [];
        this.autoRoles = [];
        this.selfRoles = [];
        this.reactionRoles = [];
        this.enabledEvents = [];
        this.disabledCommands = [];
        this.reactionRoles = [];
        this.spamProtected = undefined;
        this.allowedInviteChannels = undefined;
        this.allowedBwChannels = undefined;
        this.allowedSpamChannels = undefined;
        this.allowedCapsChannels = undefined;
        this.allowedMentionChannels = undefined;
        this.logExcluded = [];
    }

    public async _loadSettings(): Promise<void> {
        const settings: GuildSettings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: "settings",
        });
        if (!settings) {
            const entry: GuildSettings = new this.guild.client.mongo.guildconfig({
                guildID: this.guild.id,
                type: "settings",
                prefix: this.prefix,
                modlogChannel: this.modlogChannel,
                serverlogChannel: this.serverlogChannel,
                welcomeChannel: this.welcomeChannel,
                welcomeLocation: this.welcomeLocation,
                levelMsg: this.levelMsg,
                levelMessaging: this.levelMessaging,
                packages: this.packages,
                kickPoints: this.kickPoints,
                banPoints: this.banPoints,
                muteRole: this.muteRole,
                autoRoles: this.autoRoles,
                messageLogging: this.messageLogging,
                modLogging: this.modLogging,
                serverLogging: this.serverLogging,
                welcomeMsg: this.welcomeMsg,
                welcomeEnabled: this.welcomeEnabled,
                welcomerEmbed: this.welcomerEmbed,
                invProtected: this.invProtected,
                bwProtected: this.bwProtected,
                badWords: this.badWords,
                spamProtected: this.spamProtected,
                allowedInviteChannels: this.allowedInviteChannels,
                allowedBwChannels: this.allowedBwChannels,
                allowedSpamChannels: this.allowedSpamChannels,
                allowedCapsChannels: this.allowedCapsChannels,
                allowedMentionChannels: this.allowedMentionChannels,
                logExcluded: this.logExcluded,
            });

            await entry.save();
        } else {
            for (const key of Object.keys(this)) {
                if (key === "guild") { continue; }
                const value: any = settings.get(key);
                if (value !== undefined) { this[key] = value; }
            }
        }
    }

    public async set(key: string, value: any): Promise<Boolean | Object> {
        const settings: GuildSettings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: "settings",
        });
        if (!settings) { return false; }
        if (!this.hasOwnProperty(key)) { return; }
        settings.set(key, value);
        await settings.save();
        await this.guild.client.emit("guildConfigUpdate", this.guild);

        return new Promise((r) => setTimeout(() => r(this), 25));
    }

    public async setArray(key: string, value: string[] | string, isWeb?: boolean): Promise<Object> {
        const settings: GuildSettings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: "settings",
        });
        if (settings.get(key) === undefined && !this.hasOwnProperty(key)) { return undefined; }
        if (isWeb) {
            const array: any = value;
            await settings.unset(key);
            await settings.set({ [key]: array });
            await settings.save();
            await this.guild.client.emit("guildConfigUpdate", this.guild, settings.get(key));

            return new Promise((r) => setTimeout(() => r(this), 25));
        } else {
            const array: any = settings.get(key) || [];
            if (array.indexOf(value) > -1) {
                array.splice(array.indexOf(value), 1);
            } else {
                array.push(value);
            }
            settings.set(key, array);
            await settings.save();
            this.guild.client.emit("guildConfigUpdate", this.guild);

            return new Promise((r) => setTimeout(() => r(this), 25));
        }
    }

}

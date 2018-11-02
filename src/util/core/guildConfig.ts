import { FoxGuild } from "../extensions";
export default class GuildConfig {
    public readonly guild: FoxGuild;
    public readonly prefix: string;
    public readonly modlogChannel: any;
    public readonly serverlogChannel: any;
    public readonly welcomeChannel: any;
    public readonly welcomeEnabled: boolean;
    public readonly welcomeMsg: string;
    public readonly welcomerEmbed: boolean;
    public readonly welcomeLocation: any;
    public readonly goodbyeEnabled: boolean;
    public readonly goodbyeChannel: any;
    public readonly goodbyeEmbed: boolean;
    public readonly goodbyeMsg: string;
    public readonly levelMsg: string;
    public readonly packages: string[];
    public readonly kickPoints: number;
    public readonly banPoints: number;
    public readonly muteRole: any;
    public readonly delModCmds: boolean;
    public readonly msgAfterMod: boolean;
    public readonly tacMode: boolean;
    public readonly mentionLimit: number;
    public readonly messageLogging: boolean;
    public readonly modLogging: boolean;
    public readonly massProtected: boolean;
    public readonly serverLogging: boolean;
    public readonly levelMessaging: boolean;
    public readonly invProtected: boolean;
    public language: string;
    public readonly bwProtected: boolean;
    public badWords: string[];
    public autoRoles: any[];
    public selfRoles: any[];
    public reactionRoles: any[];
    public enabledEvents: string[];
    public disabledCommands: string[];
    public readonly spamProtected: boolean;
    public readonly allowedInviteChannels: any[];
    public readonly allowedBwChannels: any[];
    public readonly allowedSpamChannels: any[];
    public readonly allowedCapsChannels: any[];
    public readonly allowedMentionChannels: [];
    public readonly logExcluded: boolean;

    public constructor(guild: FoxGuild) {
        this.guild = guild;
        this.prefix = guild.client.commandPrefix;
        this.modlogChannel = null;
        this.serverlogChannel = null;
        this.welcomeEnabled = null;
        this.welcomeMsg = null;
        this.welcomerEmbed = null;
        this.welcomeLocation = null;
        this.goodbyeEnabled = null;
        this.goodbyeChannel = null;
        this.goodbyeEmbed = null;
        this.goodbyeMsg = null;
        this.levelMsg = null;
        this.packages = [];
        this.kickPoints = null;
        this.banPoints = null;
        this.muteRole = null;
        this.delModCmds = null;
        this.msgAfterMod = null;
        this.tacMode = null;
        this.mentionLimit = null;
        this.messageLogging = null;
        this.modLogging = null;
        this.massProtected = null;
        this.serverLogging = null;
        this.levelMessaging = null;
        this.invProtected = null;
        this.language = "English";
        this.bwProtected = null;
        this.badWords = [];
        this.autoRoles = [];
        this.selfRoles = [];
        this.reactionRoles = [];
        this.enabledEvents = [];
        this.disabledCommands = [];
        this.reactionRoles = [];
        this.spamProtected = null;
        this.allowedInviteChannels = null;
        this.allowedBwChannels = null;
        this.allowedSpamChannels = null;
        this.allowedCapsChannels = null;
        this.allowedMentionChannels = null;
        this.logExcluded = null;
    }

    public async _loadSettings(): Promise<void> {
        const settings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: "settings"
        });
        if (!settings) {
            const entry = new this.guild.client.mongo.guildconfig({
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
                muteRoles: this.muteRole,
                autoRoles: this.autoRole,
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
                logExcluded: this.logExcluded
            });
            await entry.save();
        } else {
            for (const key of Object.keys(this)) {
                if (key === "guild") continue;
                const value = settings.get(key);
                if (value !== undefined) this[key] = value;
            }
        }
    }

    public async set(key: string, value: any): Promise<Boolean|Object> {
        const settings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: "settings"
        });
        if (!settings) return false;
        if (!this.hasOwnProperty(key)) return;
        settings.set(key, value);
        await settings.save();
        await this.guild.client.emit("guildConfigUpdate", this.guild);
        return new Promise(r => setTimeout(() => r(this), 25));
    }

    public async setArray(key: string, value: string[] | string, isWeb?: boolean): Promise<Object> {
        const settings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: "settings"
        });
        if (settings.get(key) === undefined && !this.hasOwnProperty(key)) return null;
        if (isWeb) {
            const array = value;
            await settings.unset(key);
            await settings.set({ [key]: array });
            await settings.save();
            await this.guild.client.emit("guildConfigUpdate", this.guild, settings.get(key));
            return new Promise(r => setTimeout(() => r(this), 25));
        } else {
            const array = settings.get(key) || [];
            if (array.indexOf(value) > -1) {
                array.splice(array.indexOf(value), 1);
            } else {
                array.push(value);
            }
            settings.set(key, array);
            await settings.save();
            this.guild.client.emit("guildConfigUpdate", this.guild);
            return new Promise(r => setTimeout(() => r(this), 25));
        }
    }

}

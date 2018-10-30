export default class guildConfig {

    constructor(guild) {
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
        this.language = 'English';
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

    async _loadSettings() {
        const settings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: 'settings'
        });
        if (!settings) {
            const entry = new this.guild.client.mongo.guildconfig({
                guildID: this.guild.id,
                type: 'settings',
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
                allowedBwChannels: this.allowedBwchannels,
                allowedSpamChannels: this.allowedSpamChannels,
                allowedCapsChannels: this.allowedCapsChannels,
                allowedMentionChannels: this.allowedMentionChannels,
                logExcluded: this.logExcluded
            });
            await entry.save();
        } else {
            for (const key of Object.keys(this)) {
                if (key === 'guild') continue;
                const value = settings.get(key);
                if (value !== undefined) this[key] = value;
            }
        }
    }

    async set(key, value) {
        const settings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: 'settings'
        });
        if (!settings) return false;
        if (!this.hasOwnProperty(key)) return;
        settings.set(key, value);
        await settings.save();
        await this.guild.client.emit('guildConfigUpdate', this.guild);
        return new Promise(r => setTimeout(() => r(this), 25));
    }

    async setArray(key, value, isWeb) {
        const settings = await this.guild.client.mongo.guildconfig.findOne({
            guildID: this.guild.id,
            type: 'settings'
        });
        if (settings.get(key) === undefined && !this.hasOwnProperty(key)) return null;
        if (isWeb) {
            const array = value;
            await settings.unset(key);
            await settings.set({ [key]: array });
            await settings.save();
            await this.guild.client.emit('guildConfigUpdate', this.guild, settings.get(key));
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
            this.guild.client.emit('guildConfigUpdate', this.guild);
            return new Promise(r => setTimeout(() => r(this), 25));
        }
    }

}

const Command = require("../../util/core/Command");
const embed = new (require("discord.js")).MessageEmbed();
const options = ["On", "Off", "on", "off", "ON", "OFF", null];
const sendlocations = ["DM", "server", "dm", "Server", null];

module.exports = class ConfigCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "config",
            description: "Shows or sets the server settings.",
            usage: "[setting type] [value]",
            guildOnly: true,
            requiredPerms: ["Guild Owner"]
        });
    }

    public hasPermission(message) {
        if (message.client.isOwner(message.author.id)) return true;
        else if (message.guild.perms.check("core.manageserver")) return true;
        else if (message.guild.ownerID === message.author.id) return true;
        else return false;
    }

    public async run(message, args, prefix) {
        const settings = message.guild.config;
        if (!args[0]) {
            const embed = new (require("discord.js")).MessageEmbed()
                .setAuthor("Guild Settings", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`
**Prefix:** \`${await settings.prefix}\`
**Welcome Messages:** ${message.guild.config.welcomeEnabled ? "On" : "Off"}
**Level Up Messages:** ${settings.levelMessaging ? "On" : "Off"}
**Muted Role:** ${settings.muteRole ? message.guild.roles.get(settings.muteRole) : "None"}
**Auto Role:** ${settings.autoRole ? message.guild.roles.get(settings.autoRole) : "None"}
**Moderation Logging:** ${settings.modLogging ? "On" : "Off"}
**Server Logging:** ${settings.serverLogging ? "On" : "Off"}
**Welcome Message Location**: ${settings.welcomeLocation || "None"}
**Welcome Message Channel**: ${settings.welcomeChannel ? message.guild.channels.get(await settings.welcomeChannel) : "None"}
**Mod-log Channel:** ${settings.modlogChannel ? this.client.channels.get(settings.modlogChannel) : "None"}
**Server-log Channel:** ${settings.serverlogChannel ? this.client.channels.get(settings.serverlogChannel) : "None"}
**Message Update/Delete Logging:** ${settings.messageLogging ? "On" : "Off"}


Keys:
**messagelogging:** Whether to log deleted/edited messages to the designated server-log channel. (on/off)
**levelmsg:** Whether to enable level up messages when a member has leveled up. (on/off)
**modlogging:** Whether to log moderation actions (kick/ban/unban) to the designated mod-log channel. (on/off)
**serverlogging:** Whether to log all server events (member/user change, member join/leave) to the designated server-log channel. (on/off)
**prefix:** What commands start with. (string)
**welcomemsg:** Whether or not welcome messages should be active for new members. (on/off)
**wchannel**: Channel where welcome messages will go, if messages are configured to be sent to a server. (channel)
**wlocation**: Where welcome messages will be sent. (DM/server)
**modlog:** Channel where all moderation logs will go. (channel)
**serverlog:** Channel where all server-logs will go. (channel)
**muterole:** Role that will act as the Muted role. (role)
**autorole:** Role that will be given to all new members when they join. (role)
To change a setting at any time, just run \`${prefix}config [key] [value]\`. For example, !config prefix >.`);
            message.send({ embed });
        } else {
            return await this.checkConfig(message, args);
        }
    }

    public async checkConfig(message, args) {
        if (args[0].match(/^modlog$/i)) {
            const channel = await this.channel(args[1], message);
            if (!channel) return message.error(" Please specify a valid channel.");
            const permissions = channel.permissionsFor(message.guild.me);
            if (!permissions.has("VIEW_CHANNEL") && !permissions.has("SEND_MESSAGES")) return message.error(" I do not have read and/or send permissions to this channel.");
            const ch = await message.guild.config.set("modlogChannel", channel.id);
            // if (!ch) return message.error(` There was an error configuring the option. If you encounter this more than once, please notify a Fox Developer in the official Discord server.`);
            embed
                .setAuthor("Set Modlog", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the new mod-log channel as ${channel} <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/^serverlog$/i)) {
            const serverchannel = await this.channel(args[1], message);
            if (!serverchannel) return message.error(" Please specify a valid channel.");
            const perms = serverchannel.permissionsFor(message.guild.me);
            if (!perms.has("VIEW_CHANNEL") && !perms.has("SEND_MESSAGES")) return message.error(" I do not have read and/or send permissions to this channel.");
            const channel = await message.guild.config.set("serverlogChannel", serverchannel.id);
            // if (!channel) return message.error(` There was an error configuring the option. If you encounter this more than once, please notify a Fox Developer in the official Discord server.`);
            embed
                .setAuthor("Set Server Log", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the new server-log channel as ${serverchannel} <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/prefix/i)) {
            let pf = args[1];
            if (!pf) return message.error(" Please specify a prefix to set.");
            if (pf === "f)") pf = "f\\)";
            const setPrefix = await message.guild.config.set("prefix", pf);
            // if (!setPrefix) return message.error(` There was an error configuring the option. If you encounter this more than once, please notify a Fox Developer in the official Discord server.`);
            embed
                .setAuthor("Change Prefix", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the new prefix as \`${message.guild.config.prefix}\` <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/muterole/i)) {
            const role = await this.role(args[1], message);
            if (!role) return message.error(" Please specify valid role.");
            await message.guild.config.set("muteRole", role.id);
            // if (!muterole) return message.error(` There was an error configuring the option. If you encounter this more than once, please notify a Fox Developer in the official Discord server.`);
            embed
                .setAuthor("Change Mute Role", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the new Muted role as ${role} <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/autorole/i)) {
            const role = await this.role(args[1], message);
            if (!role) return message.error(" Please specify a valid role.");
            await message.guild.config.set("autoRole", role.id);
            embed
                .setAuthor("Change Auto Role", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set ${role ? `the new auto role as ${role} <:check:314349398811475968>` : `Auto Roles to **off** <:check:314349398811475968>`}`);
            message.send({ embed });
        } else if (args[0].match(/messagelogging/i)) {
            const option = args[1];
            let bool;
            if (!option) return message.error(" Please specify a valid option.");
            if (!options.includes(option)) return message.error(" Sorry, that wasn't a recognized value.");
            const modlog = message.guild.config.modlogChannel;
            if (!modlog) return message.error(" There isn't a mod-log channel set. Please set one first, then enable message logging.");
            if (option.match(/on/i)) bool = true;
            if (option.match(/off/i)) bool = false;
            await message.guild.config.set("messageLogging", bool);
            embed
                .setAuthor("Message Logging", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set Message Logging to **${option.toLowerCase()}** <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/modlogging/i)) {
            const opt = args[1];
            let boolean;
            if (!opt) return message.error(" Please specify a valid option.");
            if (!options.includes(opt)) return message.error(" Sorry, that wasn't a recognized value.");
            const modlog = await message.guild.config.modlogChannel;
            if (!modlog) return message.error(" There isn't a mod-log channel set. Please set one first, then enable moderation logging.");
            if (opt.match(/on/i)) boolean = true;
            if (opt.match(/off/i)) boolean = false;
            await message.guild.config.set("modLoggging", boolean);
            embed
                .setAuthor("Moderation Logging", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set Moderation Logging to **${opt.toLowerCase()}** <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/serverlogging/i)) {
            const sl = args[1];
            if (!sl) return message.error(" Please specify a valid option.");
            if (!options.includes(sl)) return message.error(" Sorry, that wasn't a recognized value.");
            const serverch = await message.guild.config.serverlogChannel;
            if (!serverch) return message.error(" There isn't a server-log channel set. Please set one first, then enable server logging.");
            let boo;
            if (sl.match(/on/i)) boo = true;
            if (sl.match(/off/i)) boo = false;
            await message.guild.config.set("serverLogging", boo);
            embed
                .setAuthor("Server Logging", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set Server Logging to **${sl.toLowerCase()}** <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/welcomemsg/)) {
            const welcomeopt = args[1];
            if (!welcomeopt) return message.error(" Please specify a valid option.");
            if (!options.includes(welcomeopt)) return message.error(" Sorry, that wasn't a recognized value.");
            let welcomeboolean;
            if (welcomeopt.match(/on/i)) welcomeboolean = true;
            if (welcomeopt.match(/off/i)) welcomeboolean = false;
            await message.guild.config.set("welcomeEnabled", welcomeboolean);
            embed
                .setAuthor("Welcome Messaging", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set Welcome Messaging to **${welcomeopt.toLowerCase()}** <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/levelmsg/i)) {
            const option = args[1];
            if (!option) return message.error(" Please specify a valid option.");
            if (!options.includes(option)) return message.error(" Sorry, that wasn't a recognized value.");
            let welcomeboolean;
            if (option.match(/on/i)) welcomeboolean = true;
            if (option.match(/off/i)) welcomeboolean = false;
            await message.guild.config.set("levelMessaging", welcomeboolean);
            embed
                .setAuthor("Level Up Messaging", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set Level Up Messaging to **${option.toLowerCase()}** <:check:314349398811475968>`);
            message.send({ embed });
        } else if (args[0].match(/wlocation/i)) {
            let welcomeopt = args[1];
            if (!welcomeopt) return message.error(" Please specify a valid option.");
            if (welcomeopt.match(/none/i)) welcomeopt = null;
            if (!sendlocations.includes(welcomeopt)) return message.error(" Sorry, that wasn't a recognized value.");
            if (this.client.capitalizeStr(welcomeopt || "") === "Server" && !message.guild.channels.get(message.guild.config.welcomeChannel)) return message.channel.send("<:nicexmark:495362785010647041>  You do not have a valid welcome channel set up. Please set one before setting the server option.");
            await message.guild.config.set("welcomeLocation", welcomeopt);
            embed
                .setAuthor("Welcome Message Location", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the Welcome Messaging channel to ${welcomeopt ? `be sent to a **${this.client.capitalizeStr(welcomeopt)}** <:check:314349398811475968>` : "**None**."}`);
            message.channel.send({ embed });
        } else if (args[0].match(/wchannel/i)) {
            const channel = await this.channel(args[1], message);
            if (!channel) return message.error(" Please specify a valid channel.");
            const perms = channel.permissionsFor(message.guild.me);
            if (!perms.has(["SEND_MESSAGES", "VIEW_CHANNEL"])) return message.error(" I do not have read and/or send permissions to this channel.");
            await message.guild.config.set("welcomeChannel", channel.id);
            embed
                .setAuthor("Set Welcome Channel", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the new welcome message channel as ${channel} <:check:314349398811475968>`);
            message.send({ embed });
        }
    }

};

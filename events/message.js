import { Event } from '../util';
import { invProtect, spamProtect, massProtect, badWords } from '../util/core/Automod';
const tiers = {
    1: 'Bronze',
    2: 'Silver',
    3: 'Gold'
};

export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'message',
            description: 'Fires when a message is sent in a server.'
        });
    }

    async run(message) {
        if (message.author.bot) return;
        if (message.guild && !message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;
        if (message.guild) await this.pkgInitialize(message);
        const commandPrefix = message.guild ? message.guild.config.prefix : this.client.commandPrefix;
        const prefix = new RegExp(`^<@!?${this.client.user.id}> |^${this.regExpEsc(commandPrefix || 'f)')}`).exec(message.content);
        if (!prefix) return;
        const args = message.content.slice(prefix[0].length).trim().split(/ +/g);
        const command = this.client.commands.get(args.shift().toLowerCase());
        if (!command) return this.client.emit('unknownCommand', message);
        message._registerCommand(command);
        if (!message.author.upvoter) await message.author._setUpvoter();
        if (typeof message.author.patreonTier !== 'number') await message.author._setTier();
        if (command.guildOnly && !message.guild) return message.error('Sorry, this command can only be ran in a guild channel.');
        if (message.guild.config.disabledCommands ? message.guild.config.disabledCommands.indexOf(command.name) > -1 : null) return message.error('This command has been disabled by the server administrator.');
        if (!message.guild.packages.get(command.category).enabled) return message.error(` The **${this.client.capitalizeStr(command.category)}** package is currently disabled. Enable it with the enablepkg command.`);
        if (typeof command.hasPermission === 'function' && !command.hasPermission(message)) return message.error(' _**Sorry, but you do not have permission to use this command.**_'); 
        if (command.patreonTier > message.guild.owner.user.patreonTier) return message.error(`I'm sorry, but ${message.author.id === message.guild.ownerID ? `you need at least the **${tiers[String(command.patreonTier)]}** patreon tier to enable this command for your server. Check out our available Patreon subscriptions here: https://patreon.com/foxdevteam` : `your server owner needs to subscribe to the **${tiers[String(command.patreonTier)]}** tier on Patreon for you to use this command.`}`);
        this.client.commandsRun++;

        if (!this.client.commands.cooldowns.has(command.name)) this.client.commands.cooldowns.set(command.name, new (require('discord.js')).Collection());
        const now = Date.now();
        const timestamps = this.client.commands.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 0) * 1000;

        if (!timestamps.has(message.author.id)) {
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.error(`You must wait ${require('moment').duration(parseInt(timeLeft), 'seconds').format('h [hours], m [minutes and] s [seconds]')} before using this command again.`);
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }

        try {
            command._registerExecutor(message);
            if (command.category === 'Moderation' && message.guild.config.delModCmds) message.delete().catch(() => 0);
            await command.run(message, args, commandPrefix);
        } catch (error) {
            this.client.emit('commandError', message, error);
        }
    }

    async pkgInitialize(message) {
        message.guild.leveling.listen(message);
        message.guild.banking.listen(message);
        try {
            badWords(message);
            await invProtect(message);
            await massProtect(message);
            await spamProtect(message);
        } catch (error) {
            console.error(error);
        }
    }

    regExpEsc(str) {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

}

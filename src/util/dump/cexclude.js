const Command = require('../../util/core/Command');
module.exports = class ExcludeCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'cexclude',
            description: 'Excludes a channel from XP gaining.',
            usage: '[channel]',
            guildOnly: true
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('economy.bankteller');
    }

    async run(message, args) {
        /* const channel = message.mentions.channels.first() || message.guild.channels.find(channel => channel.name === args.join(' '));
        if (!channel) {
            const res = await this.client.banking.excludeChannel(message.channel, message.guild).catch(() => null);
            if (!res) return message.error(' Sorry, but I could not complete this operation.');
            if (res === 'Already') return message.success(` Removed the banking exclusion from ${message.channel}.`);
            message.delete().catch(() => 0);
            message.success(` Successfully excluded ${message.channel} from banking.`);
        } else {
            const res = await this.client.banking.excludeChannel(channel, message.guild).catch(() => null);
            if (!res) return message.error(' Sorry, but I could not complete this operation.');
            if (res === 'Already') return message.success(` Removed the banking exclusion from ${channel}.`);
            message.delete().catch(() => 0);
            message.success(` Successfully excluded ${channel} from banking.`);
        }*/
    }

};

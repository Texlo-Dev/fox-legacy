import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'daily',
            description: 'Collect your daily money, or give it to someone else.',
            guildOnly: true,
            requiredPerms: ['`economy.banking`'],
            usage: '[user]'
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('economy.banking', message);
    }

    async run(message) {
        const user = message.mentions.users.first();
        if (!user) {
            const result = await message.guild.banking.giveDaily(message.author, { guild: message.guild });
            if (result === false) return message.error(`You don't have an account set up. Chat in a channel to get set up!`);
            if (typeof result === 'number') return message.error(`Oops, it looks like you have already received your daily ${message.guild.banking.currency} for the day. Check back here in ${require('moment').duration(result).format(`h [hours and] m [minutes].`)}`);
            if (result === true) message.reply('You have received your daily ¥500. Check back tomorrow for more!');
        } else {
            const result = await message.guild.banking.giveDaily(message.author, { guild: message.guild, amount: 500 });
            await message.guild.banking.addMoney(user, { guild: message.guild, amount: 500 });
            const check = await message.guild.banking.removeMoney(message.author, { guild: message.guild, amount: 500 });
            if (!check) return message.error('You cannot donate at this time.');
            if (result === false) return message.error(`This user doesn't have an account set up.`);
            if (typeof result === 'number') return message.error(`Oops, it looks like you have already received your daily ${message.guild.banking.currency} for the day, and cannot donate yet. Check back here in ${require('moment').duration(result).format(`h [hours and] m [minutes].`)}`);
            if (result === true) message.reply(`You have given your your daily ¥500 to ${user.username}. Check back tomorrow for more!`);
        }
    }

}


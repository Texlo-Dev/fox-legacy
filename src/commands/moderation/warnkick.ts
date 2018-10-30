import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'warnkick',
            description: 'Sets the max warning points value before an automatic kick.',
            guildOnly: true,
            requiredPerms: ['`core.manageserver`'],
            usage: '<number>',
            extendedUsage: { number: client.args.number }
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('core.manageserver', message);
    }

    async run(message, [int]) {
        const num = parseFloat(int);
        if (!num) return message.error(' Please specify a valid number.');
        const res = message.guild.config.set('kickPoints', num);
        if (!res) return message.error(' There was an error performing this operation.');
        return message.success(` Successfully set the max warning points before auto-kick to **${num}**.`);
    }

}

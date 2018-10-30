import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'slowmode',
            description: 'Activates slowmode for a channel.',
            usage: '<time | disable>',
            guildOnly: true,
            extendedUsage: {
                time: client.args.duration
            },
            requiredPerms: ['`mod.silencer`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('mod.silencer', message);
    }

    async run(message, [time]) {
        if (time === 'disable' || time === 'false') { time = 0; } else {
            time = this.client.spanMs(time) / 1000;
            if (!time) return message.error('You must tell me the time (from 1 second to 2 minutes)');
            if (time < 1 || time > 120) return message.error('Invalid time! Time goes from 1 second to 2 minutes!');
        }

        this.client.api.channels(message.channel.id).patch({ data: { rate_limit_per_user: time } });
        return message.send(`I have ${time == 0 ? 'disabled' : 'set'} the slowmode for this channel.`);
    }

}

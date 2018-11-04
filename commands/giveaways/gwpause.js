import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'gwpause',
            description: 'Pauses a currently running giveaway.',
            requiredPerms: ['`giveaway.leader`'],
            usage: '<name>'
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('giveaway.leader', message);
    }

    async run(message, [...name]) {
        if (!name.join(' ')) return message.error(' Please specify a new giveaway to pause.');
        if (!message.guild.giveaways.get(name.join(' '))) return message.error(' This is not a valid giveaway.');
        const m = await message.send('<a:typing:393848431413559296> Pausing giveaway....');
        message.guild.giveaways.get(name.join(' ')).pause()
            .then(() => m.edit('<:checkmark:495362807731060757> Successfully paused the giveaway.'))
            .catch(error => m.edit(`<:nicexmark:495362785010647041> I could not pause this giveaway. ${error.message}`));
    }

}


import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'rmpatreon',
            description: 'Removes a patreon to the database.',
            usage: '<tier> <user>',
            requiredPerms: ['Server Staff']
        });
    }

    hasPermission(message) {
        return message.client.isDev(message.author.id);
    }

    async run(message, args) {
        const user = await this.user(args.join(' '), message);
        if (!user) return message.send('Invalid user.');
        user.removePatreon()
            .then(message.send(`Successfully removed ${user.tag}'s patreon tier.`))
            .catch(err => message.send(`There was an error removing this tier. ${err.message}`));
    }

}

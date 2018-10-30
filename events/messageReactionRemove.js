import { Event } from '../util';
export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'messageReactionRemove',
            description: 'Fires when a reaction is removed from a message.'
        });
    }

    async run(reaction, user) {
        const message = reaction.message;
        const member = await message.guild.members.fetch(user.id);
        const config = message.guild.config;
        if (!member || !config) return;
        const enabled = message.guild.packages.get('Reaction Roles').enabled;
        const reactionRoles = config.reactionRoles;
        if (!reactionRoles || !enabled) return;
        const role = reactionRoles.filter(r => r.messageID === message.id).find(r => r.emoji.id === reaction.emoji.id);
        if (message.guild.roles.has(role.id)) member.roles.remove(role.id);
    }

}


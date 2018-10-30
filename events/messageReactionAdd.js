import { Event } from '../util';
export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'messageReactionAdd',
            description: 'Emitted whenever a reaction is removed from a message.'
        });
    }

    async run(reaction, user) {
        const message = reaction.message;
        const member = await message.guild.members.fetch(user.id);
        const config = message.guild.config;
        if (!member || !config) return;
        const reactionRoles = config.reactionRoles;
        const enabled = message.guild.packages.get('Reaction Roles').enabled;
        if (!reactionRoles || !enabled) return;
        const role = reactionRoles.filter(r => r.messageID === message.id).find(r => r.emoji.id === reaction.emoji.id);
        if (role && message.guild.roles.has(role.id)) member.roles.add(role.id);
    }

}


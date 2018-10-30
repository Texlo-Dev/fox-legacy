import { Event } from '../util';

export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'typingStart',
            description: 'Fired when a user starts typing in a channel.'
        });
    }

    async run(channel, user) {
        const guild = channel.guild;
        if (!guild) return;
        const member = await guild.members.fetch(user);
        const client = channel.client;
        await guild.config._loadSettings();
        guild.packages.forEach(p => p._setEnabled());
        const ownerRole = guild.roles.find(role => role.name === 'Server Owner');
        if (ownerRole) {
            if (client.user.id === '334841053276405760') return;
            const ownerCheck = await client.shard.broadcastEval(`this.guilds.some(g => g.ownerID === '${user.id}')`);
            if (ownerCheck.some(bool => bool === true)) {
                if (!member.roles.has(ownerRole.id)) {
                    member.roles.add(ownerRole);
                }
            } else if (member.roles.has(ownerRole.id)) {
                member.roles.remove(ownerRole);
            }
        }
    }

}

import { Event } from '../util';
export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'levelUp',
            description: 'Fired when a server member levels up.'
        });
    }

    async run(message, level) {
        const promoRoles = message.guild.leveling.promoRoles;
        const msgEnabled = message.guild.config.levelMessaging;
        const levelMsg = message.guild.config.levelMsg;
        const location = message.guild.leveling.messageLocation;
        let channel;
        if (!location) return;
        if (location === 'Current Channel') channel = message.channel;
        else if (location === 'DM') channel = message.author;
        else channel = message.guild.channels.get(location.id);
        const roles = promoRoles.filter(r => r.rank === level);
        if (msgEnabled && !roles.length) {
            channel.send(levelMsg ? levelMsg.replace(/{user}/g, `${message.author}`).replace(/{level}/g, `${level}`) : `${message.member.displayName}, you've leveled up to Level **${level}**.`);
        } else if (roles.length) {
            if (!message.guild.leveling.stackRoles) {
                const priorRoles = promoRoles.filter(r => r.rank < level);
                for (const p of priorRoles) {
                    if (!priorRoles.length) continue;
                    message.member.roles.remove(p.id);
                }
                for (const role of roles) {
                    message.member.roles.add(role.id);
                }
            } else {
                for (const role of roles) {
                    message.member.roles.add(role.id);
                }
            }
            return message.FoxEmbed({ header: 'Level-Up!' }, `@${message.member.displayName}, congratulations on reaching **Level ${level}**! You have been given the following roles: ${roles.map(p => `${message.guild.roles.get(p.id)}`).join(', ')}`);
        }
    }

}

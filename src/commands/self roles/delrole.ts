import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'delrole',
            description: 'Removed a selfrole you have assigned.',
            usage: '<rolename>',
            guildOnly: true,
            requiredPerms: ['`selfroles.use`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('selfroles.use', message);
    }

    async run(message, args) {
        if (!message.guild.me.hasPermission('MANAGE_ROLES')) return message.channel.send('<:nicexmark:495362785010647041>  I am missing the Manage Roles permissions, and therefore cannot remove roles.');
        const role = await this.role(args.join(' '), message);
        if (!role) return message.channel.send('<:nicexmark:495362785010647041>  Invalid role detected.');
        const entry = message.guild.config.selfRoles;
        if (!entry.some(r => r.id === role.id)) return message.error(` This is not an available self role.`);
        message.member.roles.remove(role);
        return message.FoxEmbed({ header: 'Remove Self Role' }, `You have removed the ${role} role.`);
    }

}


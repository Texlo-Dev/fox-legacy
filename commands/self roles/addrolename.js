import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'addrolename',
            description: 'Adds a role to the list of available selfroles.',
            usage: '<rolename>',
            guildOnly: true,
            requiredPerms: ['`selfroles.manage`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('selfroles.manage', message);
    }

    async run(message, args) {
        const role = await this.role(args.join(' '), message);
        if (!role) return message.error('Invalid role detected.');
        const entry = message.guild.config.selfRoles;
        if (entry.some(r => r.id === role.id)) return message.error(` This self role already exists.`);
        entry.push(JSON.parse(JSON.stringify(role)));
        message.guild.config.setArray('selfRoles', entry, true);
        return message.FoxEmbed({ header: 'Add New Self Role' }, `You added to the ${role} role to the list of available selfroles.`);
    }

}


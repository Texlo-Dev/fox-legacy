const scopes = ['user', 'role', 'everyone'];
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'setperm',
            description: 'Assigns a permission to a provided option.',
            usage: '<scope> <permission> <boolean> <target>',
            requiredPerms: ['`core.manageperm`'],
            guildOnly: true
        });
    }

    hasPermission(message) {
        return this.client.isOwner(message.author.id) || message.guild.perms.check('core.manageperm');
    }

    async run(message, args) {
        const scope = args[0];
        if (!scope || scopes.indexOf(scope) < 0) return message.error(`Invalid scope. Available scopes are ${scopes.join(', ')}`);
        const perm = args[1];
        const bool = this.boolean(args[2]);
        if (!message.guild.permissions.has(perm)) return message.channel.send('This permission does not exist.');
        const target = scope === 'user' ? await this.user(args.slice(3).join(' '), message) : scope === 'everyone' ? { name: '@everyone', id: message.guild.id } : await this.role(args.slice(3).join(' '), message);
        if (!target) return message.error('Invalid target specified. Must be valid user or role.');
        message.guild.perms.set(perm, target, bool ? 'allowed' : 'denied')
            .then(() => message.FoxEmbed({ header: 'Set Permission' }, `Permission \`${perm}\` for ${target.id === message.guild.id ? 'Everyone are' : `${target} is`} now set to **${bool}**.`))
            .catch(error => message.error(`Error while adding this permission. ${error}`));
    }

}

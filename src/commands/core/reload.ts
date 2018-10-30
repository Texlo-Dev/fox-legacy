import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'reload',
            description: 'Reloads a command, if it has been changed.',
            usage: '<command>',
            requiredPerms: ['Bot Owner']
        });
    }

    hasPermission(message) {
        return this.client.isOwner(message.author.id);
    }

    async run(message, [command]) {
        if (!command) return message.send('Please specify a command to reload.');
        const cmd = this.client.commands.get(command);
        if (!cmd) return message.send(`I cannot find the command \`${command}\``);
        const m = await message.send(`Attempting to reload ${command}`);
        await cmd.reload()
            .catch(e => m.edit({ embed: message.FoxEmbed({ header: 'Reload Command' }, `I failed to reload the command **${cmd.name}**.\nError: \`\`\`${e.stack}\`\`\``) }));
        m.edit({ embed: message.FoxEmbed({ header: 'Reload Command', description: `<:check:314349398811475968> Successfully reloaded the command **${cmd.name}**.` }) });
        if (this.client.shard) {
            await this.client.shard.broadcastEval(` 
            const command = this.commands.get('${command}');
            if (this.shard.id !== ${this.client.shard.id}) command.reload();`);
        }
    }


}

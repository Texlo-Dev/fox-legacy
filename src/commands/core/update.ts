import { gitPass, gitName } from '../../config.json';
import { exec } from 'child_process';
import { URL } from 'url';
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'update',
            description: 'Updates the bot, only for me.',
            requiredPerms: ['Bot Owner']
        });
    }

    hasPermission(message) {
        return message.client.isDev(message.author.id);
    }

    async run(message) {
        const gitURL = new URL('https://gitlab.com/rTexel/encipio.git');
        gitURL.password = gitPass;
        gitURL.username = gitName;
        message.channel.send(`Updating Mr.Fox...`).then(m => {
            exec(`git pull ${gitURL} master`, async (err, stdout) => {
                if (err) return m.edit(err.message.replace(new RegExp(gitURL), 'NO U'), { code: 'fix' });
                m.edit('Updated.');
                message.FoxEmbed({ header: 'Update' }, `\`\`\`${stdout}\`\`\``).then(m => {
                    m.client.shard.broadcastEval(`process.exit();`);
                });
            });
        });
    }

}


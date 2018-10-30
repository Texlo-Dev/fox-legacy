import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'restart',
            description: 'Restarts the bot on one or more shards.',
            usage: '[shardID]',
            requiredPerms: ['Bot Owner']
        });
    }


    hasPermission(message) {
        return message.client.isOwner(message.author.id);
    }

    async run(message, [shard = 'all']) {
        if (shard === 'all') {
            await message.send('<:check:314349398811475968> Restarted all shards.');
            return await this.client.shard.broadcastEval(`process.exit()`);
        }
        const num = parseInt(shard);
        if (!shard && !num) {
            await message.success(` Restarted shard ${this.client.shard.id}.`);
            process.exit();
        } else if (shard && num === undefined) {
            return message.send('Please give a shard number to reload.');
        } else {
            await message.success(` Restarted shard ${num}.`);
            this.client.shard.broadcastEval(`if (this.shard.id === ${num}) process.exit()`);
        }
    }

}

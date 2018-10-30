import { duration } from 'moment';
import 'moment-duration-format';
import { version } from '../../config.json';
import { totalmem, loadavg } from 'os';
import { MessageEmbed } from 'discord.js';
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'stats',
            description: `Shows some useful stats about the bot's backend.`
        });
    }

    async run(message) {
        const num = (await this.client.shard.fetchClientValues('guilds.size')).reduce((prev, val) => prev + val, 0);
        const users = (await this.client.shard.fetchClientValues('users.size')).reduce((prev, val) => prev + val, 0);
        const channel = (await this.client.shard.fetchClientValues('channels.size')).reduce((prev, val) => prev + val, 0);
        const mem = (await this.client.shard.broadcastEval('Math.round(100 * process.memoryUsage().heapUsed / 1024 / 1024 / 1024) / 100')).reduce((prev, val) => prev + val, 0);
        const totalMem = Math.round(100 * totalmem() / 1024 / 1024 / 1024) / 100;

        const embed = new MessageEmbed()
            .setAuthor(`${this.client.user.username} Stats`, this.client.user.displayAvatarURL())
            .setColor(0xcd853f)
            .setTimestamp()
            .addField('Version', `${version}`, true)
            .addField('Servers', `${num.toLocaleString()}`, true)
            .addField('Total Shards', this.client.shard.count, true)
            .addField('Users', `${users.toLocaleString()}`, true)
            .addField('Channels', channel.toLocaleString(), true)
            .addField('Voice Connections', this.client.voice.connections.size.toLocaleString(), true)
            .addField('Uptime', duration(this.client.uptime).format(`d[d], h[h], m[m], s[s]`), true)
            .addField('Load Averages', loadavg().map(o => Math.round(100 * o) / 100).join(', '), true)
            .addField('Memory Usage', `${mem.toFixed(1)} GB/${totalMem.toFixed(1)} GB`, true)
            .setFooter(`Shard#${this.client.shard.id}`);
        message.send({ embed });
    }

}

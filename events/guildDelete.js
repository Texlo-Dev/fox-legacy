import { MessageEmbed, WebhookClient } from 'discord.js';
import { dbotsKey, discordbotsKey, dboatsKey } from '../config.json';
import { Event } from '../util';

export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'guildDelete',
            description: 'Fires whenever a guild is left.'
        });
    }

    async run(guild) {
        const client = guild.client;
        console.log(`Left ${guild.name}`);
        client.user.setActivity(`on shard #${client.shard.id}/${client.shard.count}: ${client.guilds.size} servers | ${client.commandPrefix}help`);
        await this.deleteSettings(guild);
        client.axios('POST', {
            url: `https://discordbots.org/api/bots/${client.user.id}/stats`,
            body: { shard_id: client.shard.id, shard_count: client.shard.count, server_count: client.guilds.size },
            headers: { Authorization: dbotsKey }
        }).then(console.log('Updated dbots.org status.')).catch(console.error);

        client.axios('POST', {
            url: `https://bots.discord.pw/api/bots/${client.user.id}/stats`,
            body: { shard_id: client.shard.id, shard_count: client.shard.count, server_count: client.guilds.size },
            headers: { Authorization: discordbotsKey }
        }).then(console.log('Updated bots.discord.pw status.')).catch(console.error);

        const num = (await this.client.shard.fetchClientValues('guilds.size')).reduce((prev, val) => prev + val, 0);
        client.axios('POST', {
            url: `https://discord.boats/api/bot/${client.user.id}`,
            body: { server_count: num },
            headers: { Authorization: dboatsKey }
        }).then(console.log('Updated dboats.org status.')).catch(console.error);

        const webhook = new WebhookClient('364566963621462017', 'l4iJUal1lMrAlDYGr9YCvBN2SareiJD4K-5RAnMaiIpQBoIEAwiG9du7MWZzbTRtAmPX');
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTimestamp()
            .setFooter(`Shard ${guild.client.shard.id} • ${guild.client.user.username}`)
            .setTitle('Left a server..')
            .setThumbnail(guild.iconURL())
            .setDescription(`**Server name:** ${guild.name}\n**Server member count:** ${guild.memberCount}\n**Server Owner:** ${guild.owner.user.tag}`);
        webhook.send({ embeds: [embed] });
    }

    async deleteSettings(guild) {
        const settings = await guild.client.mongo.guildconfig.findOne({ guildID: guild.id });
        const perms = await guild.client.mongo.permissions.findOne({ guildID: guild.id });
        const leveling = await guild.client.mongo.leveling.findOne({ guildID: guild.id });
        await settings.remove().catch(() => 0);
        return await Promise.all([
            await perms.remove(),
            await leveling.remove()
        ]).catch(() => 0);
    }

}

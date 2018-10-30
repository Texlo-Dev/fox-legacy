import { Event } from '../util';
import { dbotsKey, discordbotsKey, dboatsKey } from '../config.json';
import FoxPermission from '../util/permissions/FoxPermission';


export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'foxReady',
            description: 'Fired when the bot has successfully logged into Discord.'
        });
    }

    async run() {
        try {
            await this.init();
        } catch (error) {
            throw `Failed to initialize shard: ${error.stack}`;
        }
        const client = this.client;
        if (client.shard.id === 0) import('../api').then(a => a.default(client));
        const games = [`on shard #${client.shard.id}/${client.shard.count}: ${client.guilds.size} servers`, 'Donate to keep us going: https://www.patreon.com/foxdevteam', null, `In the Fox Den | ${client.commandPrefix}help`, `www.mrfoxbot.xyz | ${client.commandPrefix}help`];
        client.setInterval(() => client.user.setActivity(games[Math.floor(Math.random() * games.length)]), 600000);
        console.log(`[Mr.Fox] Shard ${client.shard.id}: ONLINE. ${client.guilds.size} Servers, ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} Users, ${client.channels.size} Channels.`);
        client.setInterval(() => client.tools.checkUnmute(client), 5000);
        if (client.user.id === '333985343445663749') {
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
        }
    }

    async init() {
        const permfind = await this.client.mongo.permissions.find({ guildID: undefined });
        let perms = permfind.map(perm => perm.get());
        perms = perms.sort((p, c) => p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1);
        for (const guild of this.client.guilds.values()) {
            for (const perm of perms) {
                const foxperm = new FoxPermission(this.client, perm);
                guild.permissions.set(foxperm.name, foxperm);
                this.client.permissions.set(foxperm.name, foxperm);
            }
            await guild.config._loadSettings();
            await guild.banking._loadSettings();
            await guild.packages.forEach(p => p._setEnabled());
            await guild.perms._cache();
            await guild.commands.reloadAll();
            guild.giveaways._cache().then(() => {
                this.client.emit('giveawayStart', guild);
            });
            await guild.polls._cache();
        }
    }

};

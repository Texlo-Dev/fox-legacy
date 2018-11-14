// tslint:disable:no-magic-numbers
import { dboatsKey, dbotsKey, discordbotsKey } from "../config.json";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";
import { Permissions } from "../util/Mongo.js";
import FoxPermission from "../util/permissions/FoxPermission";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "foxReady",
            description: "Fired when the bot has successfully logged into Discord.",
        });
    }

    public async init(): Promise<void> {
        const permfind: Permissions[] = await this.client.mongo.permissions.find({ guildID: undefined });
        let perms: any[] = permfind.map(perm => perm.get());
        perms = perms
            .sort((p, c) => p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1);
        for (const guild of this.client.guilds.values()) {
            for (const perm of perms) {
                const foxperm: FoxPermission = new FoxPermission(this.client, perm);
                (guild as FoxGuild).permissions.set(foxperm.name, foxperm);
                this.client.permissions.set(foxperm.name, foxperm);
            }
            const fg: FoxGuild = guild as FoxGuild;
            await fg.config._loadSettings();
            await fg.banking._loadSettings();
            await fg.packages.forEach(p => p._setEnabled());
            await fg.perms._cache();
            await fg.commands.reloadAll();
            await fg.polls._cache();
            fg.giveaways._cache()
                .then(() => fg.giveaways.begin());
        }
    }

    public async run(): Promise<void> {
        try {
            await this.init();
        } catch (error) {
            throw new Error(`Failed to initialize shard: ${error.stack}`);
        }
        const client: FoxClient = this.client;
        if (client.shard.id === 0) { import("../api").then(a => a.default(client)); } // tslint:disable-line
        const games: string[] = [
            `on shard #${client.shard.id}/${client.shard.count}: ${client.guilds.size} servers`,
            "Donate to keep us going: https://www.patreon.com/foxdevteam",
            null,
            `In the Fox Den | ${client.commandPrefix}help`,
            `www.mrfoxbot.xyz | ${client.commandPrefix}help`
        ];
        client.setInterval(() => client.user.setActivity(games[Math.floor(Math.random() * games.length)]), 600000);
        console.log(`[Mr.Fox] Shard ${client.shard.id}: ONLINE. ${client.guilds.size} Servers, ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} Users, ${client.channels.size} Channels.`); // tslint:disable-line
        client.setInterval(() => client.tools.checkUnmute(client), 5000);
        if (client.user.id === "333985343445663749") {
            FoxClient.http("POST", {
                url: `https://discordbots.org/api/bots/${client.user.id}/stats`,
                body: {
                    shard_id: client.shard.id,
                    shard_count: client.shard.count,
                    server_count: client.guilds.size
                },
                headers: { Authorization: dbotsKey },
            })
            .then(() => console.log("Updated dbots.org status."))
            .catch(console.error);

            FoxClient.http("POST", {
                url: `https://bots.discord.pw/api/bots/${client.user.id}/stats`,
                body: {
                    shard_id: client.shard.id,
                    shard_count: client.shard.count,
                    server_count: client.guilds.size
                },
                headers: { Authorization: discordbotsKey },
            })
            .then(() => console.log("Updated bots.discord.pw status."))
            .catch(console.error);

            const num: number = (await this.client.shard.fetchClientValues("guilds.size"))
                .reduce((prev, val) => prev + val, 0);
            FoxClient.http("POST", {
                url: `https://discord.boats/api/bot/${client.user.id}`,
                body: { server_count: num },
                headers: { Authorization: dboatsKey },
            })
            .then(() => console.log("Updated dboats.org status."))
            .catch(console.error);
        }
    }

}

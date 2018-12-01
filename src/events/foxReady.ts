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
      description: "Fired when the bot has successfully logged into Discord."
    });
  }

  public async init(): Promise<void> {
    const permfind: Permissions[] = await Permissions.find({
      guildID: undefined
    });
    let perms: any[] = permfind.map(perm => perm.get());
    perms = perms.sort((p, c) =>
      p.category > c.category
        ? 1
        : p.name > c.name && p.category === c.category
        ? 1
        : -1
    );
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
      await fg.tickets._cache();
      fg.giveaways._cache().then(() => this.client.emit("giveawayStart", fg));
    }
  }

  public async run(): Promise<void> {
    try {
      await this.init();
    } catch (error) {
      throw new Error(`Failed to initialize shard: ${error.stack}`);
    }
    const client: FoxClient = this.client;
    if (client.shard.id === 0) {
      import("../api").then(a => a.default(client));
    } // tslint:disable-line
    const games: string[] = [
      `with ${
        client.guilds.size
      } servers`,
      "Donate to keep us going: https://www.patreon.com/foxdevteam",
      null,
      `In the Fox Den | ${client.commandPrefix}help`,
      `www.mrfoxbot.xyz | ${client.commandPrefix}help`
    ];
    client.setInterval(
      () =>
        client.user.setActivity(
          games[Math.floor(Math.random() * games.length)]
        ),
      600000
    );
    console.log(
      `[Cluster ${client.shard.id}] READY. ${
        client.options.shardCount
      } Shards, ${client.guilds.size} Servers, ${client.guilds
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString()} Users, ${client.channels.size} Channels.`
    ); // tslint:disable-line
    client.setInterval(() => client.tools.checkUnmute(client), 5000);
    if (client.user.id === "333985343445663749") {
      client.setInterval(() => client.postStats(), 180000);
    }
  }
}

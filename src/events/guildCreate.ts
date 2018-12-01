import { MessageEmbed, WebhookClient } from "discord.js";
import { dboatsKey, dbotsKey, discordbotsKey } from "../config.json";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions/";
import { Permissions } from "../util/Mongo.js";

export default class GuildCreate extends Event {
  public static async initializeServer(guild: FoxGuild): Promise<void> {
    const perms: Permissions = await guild.client.mongo.permissions.findOne({
      guildID: guild.id
    });
    if (!perms) {
      const server: Permissions = new guild.client.mongo.permissions({
        guildID: guild.id,
        overwrites: [
          {
            permission: "automod.freespeech",
            target: { name: "@everyone", id: guild.id },
            status: "neutral",
            channel: undefined
          }
        ]
      });
      await server.save();
      await Promise.all([
        await guild.perms._cache(),
        await guild.config._loadSettings(),
        await guild.fetchPackages()
      ]);
    }
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "guildCreate",
      description: "Fires whenever a server is joined."
    });
  }

  public async run(guild: FoxGuild): Promise<void> {
    const client: FoxClient = guild.client;
    console.log(`Joined ${guild.name}`);
    client.user.setActivity(
      `on shard #${client.shard.id}/${client.shard.count}: ${
        client.guilds.size
      } servers`
    );
    await GuildCreate.initializeServer(guild).catch(console.error);
    let channel: any = guild.channels
      .filter(
        c =>
          c.type === "text" &&
          c
            .permissionsFor(guild.me)
            .has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"])
      ) //tslint:disable-line
      .sort((a, b) => b.calculatedPosition - a.calculatedPosition)
      .first();
    if (!channel) {
      channel = await guild.members.fetch(guild.owner.user);
    }
    const embed: MessageEmbed = new MessageEmbed()
      .setColor(this.client.brandColor)
      .setThumbnail(guild.client.user.displayAvatarURL())
      .addField(
        `Welcome to ${client.user.username}.`,
        "Thanks for adding me to to your server! Please read the information below to get started."
      )
      .addField(
        "Web Dashboard",
        `To set up ${
          client.user.username
        } for your server, please click [here](http://mrfoxbot.xyz) to be directed to our web dashboard, where all packages/commands/permissions and their documentation are listed there.`
      ) // tslint:disable-line
      .addField(
        "Need Help?",
        `Feel free to join the official ${
          client.user.username
        } server, where you can receive support, chat with fellow server owners, and make feature requests at https://discord.gg/DfsqmaV.`
      ); // tslint:disable-line
    channel.send({ embed });

    /* FoxClient.http("POST", {
      url: `https://discordbots.org/api/bots/${client.user.id}/stats`,
      body: {
        shard_id: guild.shardID,
        shard_count: client.shard.totalShardCount,
        server_count: client.guilds.size
      },
      headers: { Authorization: dbotsKey }
    })
      .then(() => console.log("Updated dbots.org status."))
      .catch(console.error);

    /* FoxClient.http("POST", {
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

    const num: number = (await this.client.shard.fetchClientValues(
      "guilds.size"
    )).reduce((prev, val) => prev + val, 0);
    FoxClient.http("POST", {
      url: `https://discord.boats/api/bot/${client.user.id}`,
      body: { server_count: num },
      headers: { Authorization: dboatsKey }
    })
      .then(() => console.log("Updated dboats.org status."))
      .catch(console.error); */

    const webhook: WebhookClient = new WebhookClient(
      "364566963621462017",
      "l4iJUal1lMrAlDYGr9YCvBN2SareiJD4K-5RAnMaiIpQBoIEAwiG9du7MWZzbTRtAmPX"
    );
    const embe: MessageEmbed = new MessageEmbed()
      .setColor(this.client.brandColor)
      .setTimestamp()
      .setFooter(`Shard ${client.shard.id} • ${guild.client.user.username}`)
      .setTitle("Joined a server.")
      .setThumbnail(guild.iconURL())
      .setDescription(
        `**Server name:** ${guild.name}
                **Server member count:** ${guild.memberCount}
                **Server Owner:** ${guild.owner.user.tag}`
      );
    webhook.send({ embeds: [embe] });
  }
}

import { MessageEmbed, Permissions, WebhookClient } from "discord.js";
import { dboatsKey, dbotsKey, discordbotsKey } from "../config.json";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions/index.js";
import { FoxLeveling, GuildSettings } from "../util/Mongo.js";

export default class GuildDelete extends Event {
  public static async deleteSettings(
    guild: FoxGuild
  ): Promise<number | boolean> {
    const settings: GuildSettings = await guild.client.mongo.guildconfig.findOne(
      { guildID: guild.id }
    );
    const perms: Permissions = await guild.client.mongo.permissions.findOne({
      guildID: guild.id
    });
    const leveling: FoxLeveling = await guild.client.mongo.leveling.findOne({
      guildID: guild.id
    });
    await settings.remove().catch(() => 0);

    return Promise.all([await perms.remove(), await leveling.remove()])
      .then(() => true)
      .catch(() => 0);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "guildDelete",
      description: "Fires whenever a guild is left."
    });
  }

  public async run(guild: FoxGuild): Promise<void> {
    const client: FoxClient = guild.client;
    console.log(`Left ${guild.name}`);
    client.user.setActivity(
      `on shard #${client.shard.id}/${client.shard.count}: ${
        client.guilds.size
      } servers | ${client.commandPrefix}help`
    ); // tslint:disable-line
    await GuildDelete.deleteSettings(guild);
    FoxClient.http("POST", {
      url: `https://discordbots.org/api/bots/${client.user.id}/stats`,
      body: {
        shard_id: client.shard.id,
        shard_count: client.shard.count,
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
        .catch(console.error); */

    const num: number = (await this.client.shard.fetchClientValues(
      "guilds.size"
    )).reduce((prev, val) => prev + val, 0);
    FoxClient.http("POST", {
      url: `https://discord.boats/api/bot/${client.user.id}`,
      body: { server_count: num },
      headers: { Authorization: dboatsKey }
    })
      .then(() => console.log("Updated dboats.org status."))
      .catch(console.error);

    const webhook: WebhookClient = new WebhookClient(
      "364566963621462017",
      "l4iJUal1lMrAlDYGr9YCvBN2SareiJD4K-5RAnMaiIpQBoIEAwiG9du7MWZzbTRtAmPX"
    );
    const embed: MessageEmbed = new MessageEmbed()
      .setColor("RANDOM")
      .setTimestamp()
      .setFooter(
        `Shard ${guild.client.shard.id} • ${guild.client.user.username}`
      )
      .setTitle("Left a server..")
      .setThumbnail(guild.iconURL())
      .setDescription(
        `**Server name:** ${guild.name}\n**Server member count:** ${
          guild.memberCount
        }\n**Server Owner:** ${guild.owner.user.tag}`
      ); // tslint:disable-line
    webhook.send({ embeds: [embed] });
  }
}

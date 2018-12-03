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
    const client: FoxClient = this.client;
    console.log(`Left ${guild.name}`);
    await GuildDelete.deleteSettings(guild).catch(() => undefined);

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

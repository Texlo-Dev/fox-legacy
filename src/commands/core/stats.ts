// tslint:disable:max-line-length no-magic-numbers
import { MessageEmbed } from "discord.js";
import { duration } from "moment";
import "moment-duration-format";
import { loadavg, totalmem } from "os";
import { version } from "../../config.json";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions/index.js";

export default class FoxCommand extends Command {
  public constructor(client: FoxClient) {
    super(client, {
      name: "stats",
      description: "Shows some useful stats about the bot's backend."
    });
  }

  public async run(message: FoxMessage): Promise<void> {
    const num: number = (await this.client.shard.fetchClientValues(
      "guilds.size"
    )).reduce((prev, val) => prev + val, 0);
    const users: number = (await this.client.shard.fetchClientValues(
      "users.size"
    )).reduce((prev, val) => prev + val, 0);
    const channel: number = (await this.client.shard.fetchClientValues(
      "channels.size"
    )).reduce((prev, val) => prev + val, 0);
    const mem: number = (await this.client.shard.broadcastEval(
      "Math.round(100 * process.memoryUsage().heapUsed / 1024 / 1024 / 1024) / 100"
    )).reduce((prev, val) => prev + val, 0);
    const totalMem: number =
      Math.round((100 * totalmem()) / 1024 / 1024 / 1024) / 100; //tslint:disable-line

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        `${this.client.user.username} Stats`,
        this.client.user.displayAvatarURL()
      )
      .setColor(this.client.brandColor)
      .setTimestamp()
      .addField("Version", `${version}`, true)
      .addField("Servers", `${num.toLocaleString()}`, true)
      .addField("Total Shards", this.client.options.totalShardCount, true)
      .addField("Users", `${users.toLocaleString()}`, true)
      .addField("Channels", channel.toLocaleString(), true)
      .addField(
        "Voice Connections",
        this.client.voice.connections.size.toLocaleString(),
        true
      )
      .addField(
        "Uptime",
        duration(this.client.uptime).format("d[d], h[h], m[m], s[s]"),
        true
      )
      .addField(
        "Load Averages",
        loadavg()
          .map(o => Math.round(100 * o) / 100)
          .join(", "),
        true
      )
      .addField(
        "Memory Usage",
        `${mem.toFixed(1)} GB/${totalMem.toFixed(1)} GB`,
        true
      )
      .setFooter(
        `Cluster ${this.client.shard.id} | Shard ${message.guild.shardID}`
      );
    message.send({ embed });
  }
}

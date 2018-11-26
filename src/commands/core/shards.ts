import { MessageEmbed } from "discord.js";
import { duration } from "moment";
const uptime: (time: string) => string = time =>
  duration(time).format(" D [days], H [hrs], m [mins], s [seconds]");
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {
  public constructor(client: FoxClient) {
    super(client, {
      name: "shards",
      description: "Shows all of the currently available shards."
    });
  }

  public async run(message: FoxMessage): Promise<void> {
    const shardChannels: number[] = await this.client.shard.fetchClientValues(
      "channels.size"
    );
    const shardGuilds: number[] = await this.client.shard.fetchClientValues(
      "guilds.size"
    );
    const shardUsers: number[] = await this.client.shard.fetchClientValues(
      "users.size"
    );
    const shardMemory: number[] = await this.client.shard.broadcastEval(
      "(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)"
    ); //tslint:disable-line
    const shardUptime: number[] = await this.client.shard.broadcastEval(
      "this.uptime"
    );

    const [channels1, channels2] = shardChannels;
    const [guilds1, guilds2] = shardGuilds;
    const [users1, users2] = shardUsers;
    const [mem1, mem2] = shardMemory;
    const [time1, time2] = shardUptime;
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Shards", this.client.user.displayAvatarURL())
      // tslint:disable:max-line-length
      .setDescription(
        `
**Shard 0:** ${guilds1.toLocaleString()} servers, ${users1.toLocaleString()} users, ${channels1.toLocaleString()} channels, ${mem1} MB memory usage\nUptime: ${uptime(
          time1
        )}

**Shard 1:** ${guilds2.toLocaleString()} servers, ${users2.toLocaleString()} users, ${channels2.toLocaleString()} channels, ${mem2} MB memory usage\nUptime: ${uptime(
          time2
        )}
            `
      )
      .setFooter(this.client.user.username)
      .setTimestamp()
      .setColor(this.client.brandColor);
    message.send({ embed });
  }
}

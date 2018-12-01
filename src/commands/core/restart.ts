import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isOwner(message.author.id);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "restart",
      description: "Restarts the bot on one or more shards.",
      usage: "[shardID]",
      requiredPerms: ["Bot Owner"]
    });
  }

  public async run(
    message: FoxMessage,
    [shard = "all"]: string[]
  ): Promise<FoxMessage> {
    if (shard === "all") {
      await message.send("<:check:314349398811475968> Restarted all clusters.");

      return this.client.shard.restartAll();
    }
    const num: number = Number(shard);
    if (!shard && !num) {
      await message.success(`Restarted cluster ${this.client.shard.id}.`);
      process.exit();
    } else if (shard && !num) {
      return message.error("Please give a shard number to reload.");
    } else {
      await message.success(`Restarted cluster ${num}`);

      return this.client.shard.restart(num);
    }
  }
}

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
            requiredPerms: ["Bot Owner"],
        });
    }

    public async run(message: FoxMessage, [shard = "all"]: string[]): Promise<any[] | void> {
        if (shard === "all") {
            await message.send("<:check:314349398811475968> Restarted all shards.");

            return this.client.shard.broadcastEval("process.exit()");
        }
        const num: number = Number(shard);
        if (!shard && !num) {
            await message.success(` Restarted shard ${this.client.shard.id}.`);
            process.exit();
        } else if (shard && num === undefined) {
            return message.send("Please give a shard number to reload.");
        } else {
            await message.success(`Restarted shard ${num}.`);
            this.client.shard.broadcastEval(`if (this.shard.id === ${num}) process.exit()`);
        }
    }

}

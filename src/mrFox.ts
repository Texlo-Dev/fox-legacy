import { ShardingManager } from "kurasuta";
import { join } from "path";
import { isTestFox, token } from "./config.json";
import { FoxClient } from "./util/";
const sharder: ShardingManager = new ShardingManager(join(__dirname, "run"), {
  shardCount: 2,
  token,
  respawn: true,
  client: FoxClient,
  development: isTestFox,
  ipcSocket: "12000"
});

sharder.spawn();
sharder
  .on("ready", cluster =>
    console.log(`[Cluster ${cluster.id}] spawn complete.`)
  )
  .on("shardReady", shard => console.log(`[Shard ${shard}] spawn complete.`));

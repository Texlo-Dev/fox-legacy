import { ShardingManager } from "kurasuta";
import { join } from "path";
import { isTestFox, token } from "./config.json";
import { FoxClient } from "./util/";
// import "./util/types/index.d.ts";
const sharder: ShardingManager = new ShardingManager(join(__dirname, "run"), {
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

// tslint:disable
String.prototype.capitalize = function() {
  return this.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

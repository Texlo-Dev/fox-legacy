import { token as _token } from "./config.json";
import { ShardingManager } from "discord.js";
const Manager = new ShardingManager("./run.js", { totalShards: 2, token: _token, respawn: true });
Manager.spawn(Manager.totalShards, 3000);

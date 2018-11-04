import { token } from "./config.json";
import { ShardingManager } from "discord.js";
const Manager = new ShardingManager(`${__dirname}/run.js`, { totalShards: 2, token, respawn: true });
Manager.spawn(Manager.totalShards, 3000);
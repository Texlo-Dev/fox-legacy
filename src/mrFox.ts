import { ShardingManager } from "discord.js";
import { token } from "./config.json";
const Manager: ShardingManager = new ShardingManager(`${__dirname}/run.js`, {
  totalShards: 2,
  token,
  respawn: true
}); // tslint:disable
Manager.spawn(Manager.totalShards, 3000);

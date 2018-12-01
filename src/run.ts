import { BaseCluster } from "kurasuta";
import { token } from "./config.json";
import "./util/extensions/FoxGuild.js";
import "./util/extensions/FoxMessage.js";
import "./util/extensions/FoxUser.js";

export default class extends BaseCluster {
  public launch(): void {
    this.client.login(token);
  }
}
process.on("unhandledRejection", (error: Error) =>
  console.log(`unhandledRejection:\n${error.stack}`)
);
(process as NodeJS.EventEmitter).on("error", (error: Error) =>
  console.log(`Error:\n${error.stack}`)
);
(process as NodeJS.EventEmitter).on("warn", (error: Error) =>
  console.log(`Warning:\n${error.stack}`)
);

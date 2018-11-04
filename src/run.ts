import { FoxClient } from "./util/";
import "./util/extensions/FoxMessage.js";
import "./util/extensions/FoxGuild.js";
import "./util/extensions/FoxUser.js";
import { token } from "./config.json";
new FoxClient().login(token);

process.on("unhandledRejection", (error: Error) => console.log(`unhandledRejection:\n${error.stack}`));
(process as NodeJS.EventEmitter).on("error", (error: Error) => console.log(`Error:\n${error.stack}`));
(process as NodeJS.EventEmitter).on("warn", (error: Error) => console.log(`Warning:\n${error.stack}`));

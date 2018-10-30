import * as Util from './util';
const { FoxClient } = Util;
import './util/extensions/FoxMessage.js';
import './util/extensions/FoxGuild.js';
import './util/extensions/FoxUser.js';
import { token } from './config.json';
new FoxClient().login(token);

process.on('unhandledRejection', error => console.log(`unhandledRejection:\n${error.stack}`))
    .on('error', error => console.log(`Error:\n${error.stack}`))
    .on('warn', error => console.log(`Warning:\n${error.stack}`));

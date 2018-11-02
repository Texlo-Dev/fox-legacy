import { Structures } from "discord.js";
import FoxGuild from "./FoxGuild";
import FoxMessage from "./FoxMessage";
import FoxUser from "./FoxUser";

Structures.extend('Guild', FoxGuild);
Structures.extend('Message', FoxMessage);
Structures.extend('FoxUser', FoxUser);
export {
    FoxGuild,
    FoxUser,
    FoxMessage
};

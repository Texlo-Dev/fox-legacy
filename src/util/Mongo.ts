// tslint:disable:max-classes-per-file
import { Database, Model } from "mongorito";
const connection: Database = new Database("localhost/encipio");
export class FoxLeveling extends Model {}
export class CustomCommands extends Model {}
export class ModActions extends Model {}
export class GuildSettings extends Model {}
export class Tags extends Model {}
export class FoxBank extends Model {}
export class Polls extends Model {}
export class Patrons extends Model {}
export class SelfRoles extends Model {}
export class Permissions extends Model {}
export class Giveaways extends Model {}

connection.connect()
    .then(() => console.log("MongoDB connection established."))
    .catch((err) => {
        console.error(`Error connecting to MongoDB. ${err}`);
        process.exit();
    });
connection.register(GuildSettings);
connection.register(FoxLeveling);
connection.register(ModActions);
connection.register(CustomCommands);
connection.register(Tags);
connection.register(FoxBank);
connection.register(SelfRoles);
connection.register(Polls);
connection.register(Patrons);
connection.register(Permissions);
connection.register(Giveaways);

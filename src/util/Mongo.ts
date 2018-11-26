// tslint:disable:max-classes-per-file
import { Database, Model } from "mongorito";
const connection: Database = new Database("0.0.0.0/encipio");
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
export class Tickets extends Model {}

connection
  .connect()
  .then(() => console.log("MongoDB connection established."))
  .catch(error => {
    console.error(`Error connecting to MongoDB. ${error}`);
    process.exit();
  });
connection.register(GuildSettings);
connection.register(FoxLeveling);
connection.register(ModActions);
connection.register(CustomCommands);
connection.register(Tags);
connection.register(Tickets);
connection.register(FoxBank);
connection.register(SelfRoles);
connection.register(Polls);
connection.register(Patrons);
connection.register(Permissions);
connection.register(Giveaways);

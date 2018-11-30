// tslint:disable:no-magic-numbers
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { Permissions } from "../../util/Mongo";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isOwner(message.author.id);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "addperm",
      description: "Adds a permission to the database.",
      usage: "<name> <category> <description>",
      guildOnly: true,
      requiredPerms: ["Bot Owner"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<any> {
    const name: string = args[0];
    const category: string = args[1];
    const description: string = args.slice(2).join(" ");
    if (!name) {
      return message.error("Please specify the permission name.");
    }
    if (!category) {
      return message.send("Please specify the permisison category.");
    }
    if (!description) {
      return message.send("Please specify the description.");
    }
    const entry: Permissions = new Permissions({
      name,
      description,
      category,
      members: [],
      allowed: [],
      denied: []
    });

    await entry.save();

    return message.send(`Successfully added permission ${name}.`);
  }
}

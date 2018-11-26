import { Command, FoxClient } from "../../util";
import { FoxMessage, FoxUser } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isDev(message.author.id);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "rmpatreon",
      description: "Removes a patreon to the database.",
      usage: "<tier> <user>",
      requiredPerms: ["Server Staff"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<void> {
    const user: FoxUser = (await this.user(args.join(" "), message)) as FoxUser;
    if (!user) {
      return message.send("Invalid user.");
    }
    user
      .removePatreon()
      .then(() =>
        message.send(`Successfully removed ${user.tag}'s patreon tier.`)
      )
      .catch(err =>
        message.send(`There was an error removing this tier. ${err.message}`)
      );
  }
}

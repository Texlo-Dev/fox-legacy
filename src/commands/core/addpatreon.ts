import { Command, FoxClient } from "../../util";
import { FoxMessage, FoxUser } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isDev(message.author.id);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "addpatreon",
      guildOnly: true,
      description: "Adds a patreon to the database.",
      usage: "<tier> <user>",
      requiredPerms: ["Server Staff"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<any> {
    const tier: string = args[0];
    if (!tier) {
      return message.send("Please specify a tier.");
    }
    const possibleTiers: object = { bronze: 1, silver: 2, gold: 3 };
    if (!possibleTiers[tier]) {
      return message.send("Invalid patreon tier.");
    }
    const user: FoxUser = (await this.user(
      args.slice(1).join(" "),
      message
    )) as FoxUser;
    if (!user) {
      return message.send("Invalid user.");
    }
    user
      .addPatreon(possibleTiers[tier])
      .then(() =>
        message.send(
          `Successfully added ${user.tag} as a **${this.client.capitalizeStr(
            tier
          )}** tier.`
        )
      )
      .catch(err =>
        message.send(`There was an error adding this tier. ${err.message}`)
      );
  }
}

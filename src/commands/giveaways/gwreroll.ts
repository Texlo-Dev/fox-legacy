import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("giveaway.leader", message);
  }

  public static async run(
    message: FoxMessage,
    [...name]: string[]
  ): Promise<FoxMessage> {
    if (!name.join(" ")) {
      return message.error(" Please specify a new giveaway to reroll.");
    }
    if (!message.guild.giveaways.get(name.join(" "))) {
      return message.error(" This is not a valid giveaway.");
    }
    const m: FoxMessage = await message.send(
      "<a:typing:393848431413559296> Rerolling giveaway...."
    );
    message.guild.giveaways
      .get(name.join(" "))
      .reroll()
      .then(() =>
        m.edit(
          "<:checkmark:495362807731060757> Successfully rerolled the giveaway."
        )
      )
      .catch(error =>
        m.edit(
          `<:nicexmark:495362785010647041> I could not reroll this giveaway. ${
            error.message
          }`
        )
      );
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "gwreroll",
      description: "Picks a new winner for a giveaway that has already ended.",
      requiredPerms: ["`giveaway.leader`"],
      usage: "<name>"
    });
  }
}

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
      return message.error(" Please specify a new giveaway to pause.");
    }
    if (!message.guild.giveaways.get(name.join(" "))) {
      return message.error(" This is not a valid giveaway.");
    }
    const m: FoxMessage = await message.send(
      "<a:typing:393848431413559296> Pausing giveaway...."
    );
    message.guild.giveaways
      .get(name.join(" "))
      .pause()
      .then(() =>
        m.edit(
          "<:checkmark:495362807731060757> Successfully paused the giveaway."
        )
      )
      .catch(error =>
        m.edit(
          `<:nicexmark:495362785010647041> I could not pause this giveaway. ${
            error.message
          }`
        )
      );
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "gwpause",
      description: "Pauses a currently running giveaway.",
      requiredPerms: ["`giveaway.leader`"],
      usage: "<name>"
    });
  }
}

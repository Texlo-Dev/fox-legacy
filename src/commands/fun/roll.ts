import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static run(message: FoxMessage): Promise<FoxMessage> {
    return message.send(
      `:game_die: ${message.member.displayName} rolled a ${Math.floor(
        Math.random() * 6
      ) + 1}.`
    );
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "roll",
      description: "Rolls a die."
    });
  }
}

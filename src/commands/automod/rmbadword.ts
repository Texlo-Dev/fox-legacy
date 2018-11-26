import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("automod.badwords", message);
  }

  public static async run(
    message: FoxMessage,
    [...word]: string[]
  ): Promise<void> {
    await message.delete().catch(() => 0);
    const wd: string = word.join(" ");
    if (!wd) {
      return message.error("Please specify a bad word to remove.");
    }
    message.guild.config
      .setArray("badWords", wd)
      .then(() =>
        message.send(
          `${message.author}: I have removed that word from the blacklist.`
        )
      )
      .catch(() => message.error("This word is not currently a bad word."));
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "rmbadword",
      description: "Removes a word from the blacklist.",
      usage: "<word>",
      requiredPerms: ["`automod.badwords`"],
      guildOnly: true
    });
  }
}

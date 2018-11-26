import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("core.manageserver", message);
  }

  public static async run(
    message: FoxMessage,
    [int]: string
  ): Promise<FoxMessage> {
    const num: number = parseFloat(int);
    if (!num) {
      return message.error(" Please specify a valid number.");
    }
    const res: any = await message.guild.config
      .set("kickPoints", num)
      .catch(() => undefined);
    if (!res) {
      return message.error(" There was an error performing this operation.");
    }

    return message.success(
      ` Successfully set the max warning points before auto-kick to **${num}**.`
    );
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "warnkick",
      description:
        "Sets the max warning points value before an automatic kick.",
      guildOnly: true,
      requiredPerms: ["`core.manageserver`"],
      usage: "<number>",
      extendedUsage: { number: client.args.number }
    });
  }
}

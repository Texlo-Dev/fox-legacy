import { User } from "discord.js";
import { Banking, Command, FoxClient } from "../../util";
import { FoxMessage, FoxUser } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isOwner(message.author.id);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "addmoney",
      description: "Gives money to a certain user.",
      usage: "<user> <amount>",
      aliases: ["givemoney", "gm"],
      guildOnly: true,
      requiredPerms: ["Bot Owner"]
    });
  }

  public async run(
    message: FoxMessage,
    args: string[]
  ): Promise<void | FoxMessage> {
    const user: User = await this.user(args[0], message);
    const amount: number = Number(args[1]);
    if (!user) {
      return message.error("Please specify a valid user.");
    }
    if (!amount) {
      return message.error(
        `Please specify a ${
          message.guild.banking.currency
        } amount to give to this user.`
      );
    }
    const result: boolean = await Banking.addMoney(user, {
      amount,
      guild: message.guild
    }).catch(() => undefined);
    if (result === true) {
      message.success(
        `Successfully added ${message.guild.banking.currency +
          amount.toLocaleString()} to **${user.tag}**.`
      ); // tslint:disable-line
    } else {
      message.error("There was an error doing that transaction.");
    }
  }
}

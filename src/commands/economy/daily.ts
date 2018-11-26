import { User } from "discord.js";
import { Banking, Command, FoxClient } from "../../util";
import { FoxMessage, FoxUser } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("economy.banking", message);
  }

  public static async run(message: FoxMessage): Promise<any> {
    const user: User = message.mentions.users.first();
    if (!user) {
      const result: number | boolean = await Banking.giveDaily(message.author, {
        guild: message.guild
      });
      if (result === false) {
        return message.error(
          "You don't have an account set up. Chat in a channel to get set up!"
        );
      }
      if (typeof result === "number") {
        return message.error(
          `Oops, it looks like you have already received your daily ${
            message.guild.banking.currency
          } for the day. Check back here in ${require("moment")
            .duration(result)
            .format("h [hours and] m [minutes].")}`
        );
      } // tslint:disable-line
      if (result === true) {
        message.reply(
          "You have received your daily ¥500. Check back tomorrow for more!"
        );
      }
    } else {
      const result: number | boolean = await Banking.giveDaily(message.author, {
        guild: message.guild,
        amount: 500
      });
      await Banking.addMoney(user, { guild: message.guild, amount: 500 });
      const check: string | boolean = await Banking.removeMoney(
        message.author,
        { guild: message.guild, amount: 500 }
      );
      if (!check) {
        return message.error("You cannot donate at this time.");
      }
      if (result === false) {
        return message.error("This user doesn't have an account set up.");
      }
      if (typeof result === "number") {
        return message.error(
          `Oops, it looks like you have already received your daily ${
            message.guild.banking.currency
          } for the day, and cannot donate yet. Check back here in ${require("moment")
            .duration(result)
            .format("h [hours and] m [minutes].")}`
        );
      } // tslint:disable-line
      if (result === true) {
        message.reply(
          `You have given your your daily ¥500 to ${
            user.username
          }. Check back tomorrow for more!`
        ); // tslint:disable-line
      }
    }
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "daily",
      description: "Collect your daily money, or give it to someone else.",
      guildOnly: true,
      requiredPerms: ["`economy.banking`"],
      usage: "[user]"
    });
  }
}

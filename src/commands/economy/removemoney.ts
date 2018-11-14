import { User } from "discord.js";
import { Banking, Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return FoxClient.isOwner(message.author.id);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "removemoney",
            description: "Removes money from a user.",
            usage: "<user> <amount>",
            guildOnly: true,
            aliases: ["rm"],
            requiredPerms: ["Bot Owner"],
        });
    }

    public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const user: User = await this.user(args[0], message);
        const amount: number = Number(args[1]);
        if (!user) { return message.error(" Please specify a valid user."); }
        if (!amount) { return message.error(" Please specify an amount of :yen: to remove from this user."); }
        const result: any = await Banking.removeMoney(user, {
            amount,
            guild: message.guild,
        })
        .catch(() => undefined);
        if (result === "Account") { return message.error("Sorry, this user doesn't have a bank account."); }
        if (result === "Failed") {
            return message.error(`You cannot remove more ${message.guild.banking.currency} than they already have!`);
        }
        if (result === true) {
            return message.success(`Successfully removed ${message.guild.banking.currency + amount.toLocaleString()} from **${user.tag}**.`); // tslint:disable-line 
        }
    }

}

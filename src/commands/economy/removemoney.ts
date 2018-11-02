import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "removemoney",
            description: "Removes money from a user.",
            usage: "<user> <amount>",
            guildOnly: true,
            aliases: ["rm"],
            requiredPerms: ["Bot Owner"]
        });
    }

    public hasPermission(message) {
        return message.client.isOwner(message.author.id);
    }

    public async run(message, args) {
        const user = await this.user(args[0], message);
        const amount = parseInt(args[1]);
        if (!user) return message.error(" Please specify a valid user.");
        if (!amount) return message.error(" Please specify an amount of :yen: to remove from this user.");
        const result = await message.guild.banking.removeMoney(user, {
            amount,
            guild: message.guild
        }).catch(() => null);
        if (result === "Account") return message.reply("Sorry, this user doesn't have a bank account.");
        if (result === "Failed") return message.reply(`You cannot remove more ${message.guild.banking.currency} than they already have!`);
        if (result === true) message.reply(`Successfully removed ${message.guild.banking.currency + amount.toLocaleString()} from **${user.tag}**.`);
    }

}

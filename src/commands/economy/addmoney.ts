import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "addmoney",
            description: "Gives money to a certain user.",
            usage: "<user> <amount>",
            aliases: ["givemoney", "gm"],
            guildOnly: true,
            requiredPerms: ["Bot Owner"]
        });
    }

    public hasPermission(message) {
        return message.client.isOwner(message.author.id);
    }

    public async run(message, args) {
        const user = await this.user(args[0], message);
        const amount = parseInt(args[1]);
        if (!user) return message.error("Please specify a valid user.");
        if (!amount) return message.error(`Please specify a ${message.guild.banking.currency} amount to give to this user.`);
        const result = await message.guild.banking.addMoney(user, {
            amount,
            guild: message.guild
        }).catch(() => null);
        if (result === true) message.reply(`Successfully added ${message.guild.banking.currency + amount.toLocaleString()} to **${user.tag}**.`);
        else message.error("There was an error doing that transaction.");
    }

}

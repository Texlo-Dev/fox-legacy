import { GuildMember } from "discord.js";
import { Banking, Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("economy.consumer", message);
    }

    public static async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        let item: any = args.join(" ");
        if (!item) { return message.error("No item provided."); }
        const shopItems: any[] = message.guild.banking.shopItems;
        item = shopItems.find(i => i.name.match(new RegExp(`${item}`, "gi")));
        if (!item) { return message.error("This shop item could not be found."); }
        const member: GuildMember = await message.guild.members.fetch(message.author);
        const balance: number = await Banking.balanceOf(member);
        if (!balance || (balance - item.price) < 0) {
            return message.error("You don't have enough money to make this purchase.");
        }
        if (item.maxPurchases && item.buyers.filter(m => m.id === message.author.id).length >= item.maxPurchases) {
            return message.error("You have reached the purchase limit for this item.");
        }
        const resp: string | number = await message.sendPrompt(
            `Are you sure that you want to buy the item **${item.name}** for **${message.guild.banking.currency + item.price.toLocaleString()}**?\n\n**Before purchasing, ENABLE YOUR DMs! If you can't recieve the prize due to a blocked DM, there's nothing we can do!!**`, // tslint:disable-line
            15000,
        );
        if (!resp) { return message.error("Cancelled operation."); }
        try {
            await Banking.removeMoney(message.author, { guild: message.guild, amount: item.price });
            item.buyers.push({ id: message.author.id, date: Date.now() });
            await message.guild.banking.set("shopItems", shopItems);
            if (item.role) { member.roles.add(item.role.id); }
            if (item.value) { member.send(`**Here are the contents of your purchased item:**\n\n${item.value}`); }
            return message.success(`Success! you have bought the **${item.name}** for **${message.guild.banking.currency + item.price.toLocaleString()}**.`); // tslint:disable-line
        } catch (error) {
            return message.error(`Oops, there was an error during this process. ${error}`);
        }
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "buy",
            description: "Buy an item from the server store.",
            usage: "<item>",
            requiredPerms: ["`economy.consumer`"],
            guildOnly: true,
        });
    }

}

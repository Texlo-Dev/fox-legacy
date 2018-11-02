import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "buy",
            description: "Buy an item from the server store.",
            usage: "<item>",
            requiredPerms: ["`economy.consumer`"],
            guildOnly: true
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("economy.consumer", message);
    }

    public async run(message, args) {
        let item = args.join(" ");
        if (!item) return message.error("No item provided.");
        const shopItems = message.guild.banking.shopItems;
        item = shopItems.find(i => i.name.match(new RegExp(`${item}`, "gi")));
        if (!item) return message.error("This shop item could not be found.");
        const member = await message.guild.members.fetch(message.author);
        const balance = await message.guild.banking.balanceOf(member);
        if (!balance || (balance - item.price) < 0) return message.error(`You don't have enough money to make this purchase.`);
        if (item.maxPurchases && item.buyers.filter(m => m.id === message.author.id).length >= item.maxPurchases) return message.error("You have reached the purchase limit for this item.");
        const resp = await message.sendPrompt(
            `Are you sure that you want to buy the item **${item.name}** for **${message.guild.banking.currency + item.price.toLocaleString()}**?\n\n**Before purchasing, ENABLE YOUR DMs! If you can't recieve the prize due to a blocked DM, there's nothing we can do!!**`,
            15000
        );
        if (!resp) return message.error(`Cancelled operation.`);
        try {
            await message.guild.banking.removeMoney(message.author, { guild: message.guild, amount: item.price });
            item.buyers.push({ id: message.author.id, date: Date.now() });
            await message.guild.banking.set("shopItems", shopItems);
            if (item.role) member.roles.add(item.role.id);
            if (item.value) member.send(`**Here are the contents of your purchased item:**\n\n${item.value}`);
            return message.success(`Success! you have bought the **${item.name}** for **${message.guild.banking.currency + item.price.toLocaleString()}**.`);
        } catch (error) {
            return message.error(`Oops, there was an error during this process. ${error}`);
        }
    }

}

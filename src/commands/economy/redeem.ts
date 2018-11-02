import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "redeem",
            description: "Redeem a purchased shop item.",
            usage: "<item>",
            requiredPerms: ["`economy.banking`"],
            guildOnly: true
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("economy.banking");
    }

    public async run(message, args) {
        const item = args.join(" ");
        if (!item) return message.reply("Please specify the item name that you want to redeem.");
        let filter = m => m.author.id === message.author.id;
        const itemFind = await bankpurchases.findOne({
            guildID: message.guild.id,
            purchaser: message.author.id,
            item
        });
        if (!itemFind) return message.reply("Sorry, I didn't sell this item in the first place. Check that the item was spelled correctly and try again.");
        switch (item) {
        case "Custom Role": {
            message.reply(`Please enter your redeem code for **${item}**. You can find this in the DM you were sent. If you lost your code, contact a server mod to have them fetch it for you.`);
            const redeemCode = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
            const findCode = await bankpurchases.findOne({
                code: redeemCode.first().content,
                item: "Custom Role"
            });
            if (!findCode) return message.reply("Sorry, but that wasn't a code for **Custom Role**. Make sure you have selected the correct item and try again. If you forgot/lost your code, feel free to contact a server mod to fetch it.");
            if (findCode.get("redeemed") === true) return message.reply("Sorry, but that code was already redeemed.");
            message.reply("What would you like the role to be called?");
            const roleName = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
            // if (config.swearWords.includes(roleName.first().content)) return message.reply('Please do not use profanity. Role creation has been cancelled.')
            message.reply("What color would you like this role to be? Can be a name or a Hex Color (If Hex, remove the # and replace it with 0x). Acceptable names: Red, Orange, Yellow, Green, Blue, Purple, Black, White");
            let roleColor = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
            message.reply(`Are you sure you want to create a role with these options?\nName: ${roleName.first().content}\nColor: ${roleColor.first().content}\nReply \`yes\` to confirm, anything else to cancel.`);
            const confirmation = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
            if (confirmation.first().content !== "yes") return message.reply("Command cancelled.");
            const color = roleColor.first().content.toUpperCase();
            const role = await message.guild.createRole({
                data: {
                    name: roleName.first().content,
                    color: color
                }
            });
            message.guild.member(message.author).roles.add(role);
            message.reply("Successfully redeemed coupon and added role.");
            await findCode.set({ redeemed: true });
            await findCode.save();
            break;
        }
        }
    }

}

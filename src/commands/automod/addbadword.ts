import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "addbadword",
            description: "Adds a word that will delete any messages that contain it.",
            usage: ["<word>"],
            requiredPerms: ["`automod.badwords`"],
            guildOnly: true
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("automod.badwords", message);
    }

    public async run(message, args) {
        await message.delete().catch(() => 0);
        const word = args.join(" ");
        if (!word) return message.error("Please specify a bad word to add.");
        const res = await message.guild.config.setArray("badWords", word);
        if (!res) return message.error("This word is already added.");
        message.success(`${message.author}: I have added that word to the blacklist.`);
    }

}

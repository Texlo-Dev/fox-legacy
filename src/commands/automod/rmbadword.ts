import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "rmbadword",
            description: "Removes a word from the blacklist.",
            usage: ["<word>"],
            requiredPerms: ["`automod.badwords`"],
            guildOnly: true
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("automod.badwords", message);
    }

    public async run(message, [...word]) {
        await message.delete().catch(() => 0);
        word = word.join(" ");
        if (!word) return message.error("Please specify a bad word to remove.");
        const res = await message.guild.config.setArray("badWords", word);
        if (!res) return message.error("This word is not currently a bad word.");
        return message.send(`${message.author}: I have removed that word from the blacklist.`);
    }

}

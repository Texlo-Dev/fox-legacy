import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public constructor(client: FoxClient) {
        super(client, {
            name: "rmbadword",
            description: "Removes a word from the blacklist.",
            usage: "<word>",
            requiredPerms: ["`automod.badwords`"],
            guildOnly: true
        });
    }

    public hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("automod.badwords", message);
    }

    public async run(message: FoxMessage, [...word]) {
        await message.delete().catch(() => 0);
        const wd = word.join(" ");
        if (!wd) return message.error("Please specify a bad word to remove.");
        const res = await message.guild.config.setArray("badWords", wd);
        if (!res) return message.error("This word is not currently a bad word.");
        return message.send(`${message.author}: I have removed that word from the blacklist.`);
    }

}

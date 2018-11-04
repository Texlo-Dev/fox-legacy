import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public constructor(client: FoxClient) {
        super(client, {
            name: "addbadword",
            description: "Adds a word that will delete any messages that contain it.",
            usage: "<word>",
            requiredPerms: ["`automod.badwords`"],
            guildOnly: true
        });
    }

    public hasPermission(message: FoxMessage) {
        return message.guild.perms.check("automod.badwords", message);
    }

    public async run(message: FoxMessage, args: string[]) {
        await message.delete().catch(() => 0);
        const word: string = args.join(" ");
        if (!word) return message.error("Please specify a bad word to add.");
        const res = await message.guild.config.setArray("badWords", word);
        if (!res) return message.error("This word is already added.");
        message.success(`${message.author}: I have added that word to the blacklist.`);
    }

}

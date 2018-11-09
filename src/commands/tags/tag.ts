import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "tag",
            description: "Shows a tag!",
            usage: "<tagname>",
            guildOnly: true,
            aliases: ["t"],
            requiredPerms: ["`tag.tagger`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("tag.tagger", message);
    }

    public async run(message, args) {
        const tagname = args[0];
        if (!tagname) {
            const filter = m => m.author.id === message.author.id;
            message.reply("What tag would you like to see? This command will be automatically cancelled in 30 seconds, or by you typing `cancel`.");
            const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] }).catch(() => null);
            if (!response) { return message.reply("Time was up, so I cancelled the command."); }
            if (response.first().content.match(/cancel/i)) { return message.reply("Cancelling command now."); }
            const tag = await this.client.mongo.tags.findOne({
                tagName: response.first().content,
                guildID: message.guild.id,
            });
            if (tag) {
                tag.increment("usage_count");
                return message.send(tag.get("tagContent"));
            }
            return message.error(" Sorry, the tag you're looking for didn't exist.");
        } else {
            const tag = await this.client.mongo.tags.findOne({
                tagName: tagname.toLowerCase(),
                guildID: message.guild.id,
            });
            if (tag) {
                tag.increment("usage_count");
                message.delete().catch(() => 0);
                return message.send(tag.get("tagContent"));
            }
        }
    }

}

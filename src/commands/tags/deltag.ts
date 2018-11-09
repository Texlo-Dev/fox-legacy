import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "deltag",
            description: "Deletes a tag from the guild database.",
            guildOnly: true,
            usage: "<tagname>",
            requiredPerms: ["`tag.tageditor`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("tag.tageditor", message);
    }

    public async run(message, args) {
        const tagname = args[0];
        if (!tagname) {
            const filter = m => m.author.id === message.author.id;
            message.reply("What tag would you like to delete? This command will be automatically cancelled in 30 seconds, or by you typing `cancel`.");
            const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] }).catch(() => null);
            if (!response) { return message.reply("Time was up, so I cancelled the command."); }
            if (response.first().content.match(/cancel/i)) { return message.reply("Cancelling command now."); }
            const tag = await this.client.mongo.tags.findOne({
                guildID: message.guild.id,
                tagName: response.first().content,
            });
            if (!tag) { return message.reply("Sorry, that tag didn't exist."); }
            if (tag.get("author") !== message.author.id && !message.guild.perms.check("tag_control")) { return message.error(" Silly you! You can only delete your own tags!"); }
            return tag.remove().then(() => message.reply(`Successfully deleted the tag **${response.first().content}**.`));
        } else {
            const tag = await this.client.mongo.tags.findOne({
                guildID: message.guild.id,
                tagName: tagname.toLowerCase(),
            });
            if (!tag) { return message.reply("Sorry, that tag didn't exist."); }
            if (tag.get("author") !== message.author.id && !message.guild.perms.check("tag_control")) { return message.error(" Silly you! You can only delete your own tags!"); }
            return tag.remove().then(() => message.reply(`Successfully deleted the tag **${tagname}**.`));
        }
    }

}

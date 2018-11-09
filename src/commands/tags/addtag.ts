import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "addtag",
            description: "Adds a tag to the guild database.",
            aliases: ["tag-add", "add-tag", "addt"],
            usage: "<tagname>",
            guildOnly: true,
            requiredPerms: ["`tag.tageditor`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("tag.tageditor", message);
    }

    public async run(message, args) {
        const tagname = args[0];
        if (!tagname) { return message.error(" Please specify the name of the tag you want to create."); }
        const doesExist = await this.client.mongo.tags.findOne({ guildID: message.guild.id, tagName: tagname });
        if (doesExist) { return message.channel.send("<:nicexmark:495362785010647041>  This tag name already exists, please try again."); }
        const tagcontent = args.slice(1).join(" ");
        if (!tagcontent) {
            const filter = m => m.author.id === message.author.id;
            message.reply("What content would you like the tag to have? This command will be automatically cancelled in 60 seconds, or by you typing `cancel`.");
            const response = await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] }).catch(() => null);
            if (!response) { return message.reply("Time was up, so I cancelled the command."); }
            if (response.first().content.match(/cancel/i)) { return message.reply("Cancelling command now."); }
            const entry = new this.client.mongo.tags({
                guildID: message.guild.id,
                tagName: tagname.toLowerCase(),
                tagContent: response.first().content,
                author: message.author.id,
                createdAt: message.createdAt,
                usage_count: 0,
            });
            entry.save()
                .then(() => message.reply(`Successfully added tag ${tagname}.`)).catch(err => message.reply(`There was an error adding that tag.\n\`\`\`${err}\`\`\``));
        }
    }

}

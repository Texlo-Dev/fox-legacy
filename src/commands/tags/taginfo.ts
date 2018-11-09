import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "taginfo",
            description: "Shows info about a specific tag.",
            guildOnly: true,
            aliases: ["tag-info", "info-tag", "tag-details"],
            requiredPerms: ["`tag.tagger`"],
            usage: "<tagname>",
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("tag.tagger", message);
    }

    public async run(message, args) {
        const tagname = args[0];
        if (!tagname) {
            const filter = m => m.author.id === message.author.id;
            message.reply("What tag would you like to get more info about? This command will be automatically cancelled in 30 seconds, or by you typing `cancel`.");
            const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] }).catch(() => null);
            if (!response) { return message.reply("Time was up, so I cancelled the command."); }
            if (response.first().content.match(/cancel/i)) { return message.reply("Cancelling command now."); }
            const query = await this.client.mongo.tags.findOne({
                guildID: message.guild.id,
                tagName: response.first().content,
            });
            if (query) {
                const id = query.get("author");
                const guild = query.get("guildID");
                const embed = new MessageEmbed()
                    .setTimestamp()
                    .setColor(this.client.brandColor)
                    .setFooter(this.client.user.username)
                    .setAuthor(`${this.client.users.get(id).tag} (${id})`, `${this.client.users.get(id).displayAvatarURL()}`)
                    .addField("Name:", query.get("tagName"))
                    .addField("Guild:", this.client.guilds.get(guild).name)
                    .addField("Created At:", query.get("createdAt"))
                    .addField("Usage count:", query.get("usage_count"));
                return message.send({ embed });
            }
            return message.reply(`<:nicexmark:495362785010647041>  Sorry, I couldn't find the tag ${response.first().content}.`);
        } else {
            const query = await this.client.mongo.tags.findOne({
                guildID: message.guild.id,
                tagName: tagname.toLowerCase(),
            });
            if (query) {
                const id = query.get("author");
                const guild = query.get("guildID");
                const embed = new MessageEmbed()
                    .setTimestamp()
                    .setColor(this.client.brandColor)
                    .setFooter(this.client.user.username)
                    .setAuthor(`${this.client.users.get(id).tag} (${id})`, `${this.client.users.get(id).displayAvatarURL()}`)
                    .addField("Name:", query.get("tagName"))
                    .addField("Guild:", this.client.guilds.get(guild).name)
                    .addField("Created At:", query.get("createdAt"))
                    .addField("Usage count:", query.get("usage_count"));
                return message.send({ embed });
            }
            return message.reply(`<:nicexmark:495362785010647041>  Sorry, I couldn't find the tag ${tagname}.`);
        }
    }

}

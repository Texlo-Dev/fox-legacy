import { version } from "../../config.json";
import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "taglist",
            description: "Shows all available tags for the server.",
            guildOnly: true,
            aliases: ["tags", "all-tags", "show-tags", "tag-list"],
            requiredPerms: ["`tag.tagger`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("tag.tagger", message);
    }

    public async run(message) {
        const tag = await this.client.mongo.tags.find({ guildID: message.guild.id });
        const str = tag.map(tag => tag.get("tagName")).sort().join(", ") || "Sorry, I couldn't find any tags!";
        const embed = new MessageEmbed()
            .setFooter(`${this.client.user.username} v${version} by rTexel`)
            .setColor(11108167)
            .setAuthor("All Tags", this.client.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(`❯ Tags for **${message.guild.name}**:\n\n**${str}**`);
        message.send({ embed });
    }

}

import { MessageEmbed, User } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { Tags } from "../../util/Mongo";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("tag.tagger", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "taginfo",
            description: "Shows info about a specific tag.",
            guildOnly: true,
            aliases: ["tag-info", "info-tag", "tag-details"],
            requiredPerms: ["`tag.tagger`"],
            usage: "<tagname>",
        });
    }

    public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const tagname: string = args[0];
        if (!tagname) {
            const response: number | string = await message.sendPrompt(
                "What tag would you like to get more info about?",
                60000
            );
            switch (response) {
                case undefined:
                    return message.error("Time was up, so I cancelled the command.");
                case 0:
                    return message.error("Cancelled command.");
                default:
                    const query: Tags = await this.client.mongo.tags.findOne({
                        guildID: message.guild.id,
                        tagName: response,
                    });
                    if (query) {
                        const user: User = await this.client.users.fetch(query.get("author"));
                        const guild: string = query.get("guildID");
                        const embed: MessageEmbed = new MessageEmbed()
                        .setTimestamp()
                        .setColor(this.client.brandColor)
                        .setFooter(this.client.user.username)
                        .setAuthor(
                        `${user ? user.tag : "Unknown User"} (${user.id})`,
                        `${user ? user.displayAvatarURL() : this.client.user.displayAvatarURL()}`)
                        .addField("Name:", query.get("tagName"))
                        .addField("Guild:", this.client.guilds.get(guild).name)
                        .addField("Created At:", query.get("createdAt"))
                        .addField("Usage count:", query.get("usage_count"));

                        return message.send({ embed });
                    }

                    return message.error(`Sorry, I couldn't find the tag ${response}.`);
            }
        } else {
            const query: Tags = await this.client.mongo.tags.findOne({
                guildID: message.guild.id,
                tagName: tagname.toLowerCase(),
            });
            if (query) {
                const user: User = await this.client.users.fetch(query.get("author"));
                const guild: string = query.get("guildID");
                const embed: MessageEmbed = new MessageEmbed()
                    .setTimestamp()
                    .setColor(this.client.brandColor)
                    .setFooter(this.client.user.username)
                    .setAuthor(
                    `${user ? user.tag : "Unknown User"} (${user.id})`,
                    `${user ? user.displayAvatarURL() : this.client.user.displayAvatarURL()}`)
                    .addField("Name:", query.get("tagName"))
                    .addField("Guild:", this.client.guilds.get(guild).name)
                    .addField("Created At:", query.get("createdAt"))
                    .addField("Usage count:", query.get("usage_count"));

                return message.send({ embed });
            }

            return message.error(`Sorry, I couldn't find the tag ${tagname}.`);
        }
    }

}

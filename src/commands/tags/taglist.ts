import { MessageEmbed } from "discord.js";
import { version } from "../../config.json";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions/index.js";
import { Tags } from "../../util/Mongo.js";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("tag.tagger", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "taglist",
      description: "Shows all available tags for the server.",
      guildOnly: true,
      aliases: ["tags", "all-tags", "show-tags", "tag-list"],
      requiredPerms: ["`tag.tagger`"]
    });
  }

  public async run(message: FoxMessage): Promise<FoxMessage> {
    const tag: Tags[] = await Tags.find({
      guildID: message.guild.id
    });
    const str: string =
      tag
        .map(tag => tag.get("tagName"))
        .sort()
        .join(", ") || "Sorry, I couldn't find any tags!";
    const embed: MessageEmbed = new MessageEmbed()
      .setFooter(`${this.client.user.username} v${version} by rTexel`)
      .setColor(this.client.brandColor)
      .setAuthor("All Tags", this.client.user.displayAvatarURL())
      .setTimestamp()
      .setDescription(`❯ Tags for **${message.guild.name}**:\n\n**${str}**`);

    return message.send({ embed });
  }
}

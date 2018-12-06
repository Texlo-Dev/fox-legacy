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
    const mytags: string =
      tag
        .filter(t => t.get("author") === message.author.id)
        .map(tg => tg.get("tagName"))
        .sort()
        .join(", ") || "No Tags.";
    const str: string =
      tag
        .filter(t => t.get("author") !== message.author.id)
        .map(tg => tg.get("tagName"))
        .sort()
        .join(", ") || "No Tags.";
    const embed: MessageEmbed = new MessageEmbed()
      .setFooter(`${this.client.user.username} v${version} by rTexel`)
      .setColor(this.client.brandColor)
      .addField("Your Created Tags", mytags)
      .addField("All Server Tags", str)
      .setAuthor("Tags", this.client.user.displayAvatarURL());

    return message.send({ embed });
  }
}

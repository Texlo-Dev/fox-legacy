import { Collection, Message, Snowflake } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { Tags } from "../../util/Mongo";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("tag.tageditor", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "addtag",
      description: "Adds a tag to the guild database.",
      aliases: ["tag-add", "add-tag", "addt"],
      usage: "<tagname>",
      guildOnly: true,
      requiredPerms: ["`tag.tageditor`"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const tagname: string = args[0];
    if (!tagname) {
      return message.error(
        " Please specify the name of the tag you want to create."
      );
    }
    const doesExist: Tags = await this.client.mongo.tags.findOne({
      guildID: message.guild.id,
      tagName: tagname
    });
    if (doesExist) {
      return message.error("This tag name already exists, please try again.");
    }
    const tagcontent: string = args.slice(1).join(" ");
    if (!tagcontent) {
      const response: number | string = await message.sendPrompt(
        "What content would you like the tag to have?",
        60000
      );
      switch (response) {
        case undefined:
          return message.error("Time was up, so I cancelled the command.");
        case 0:
          return message.error("Cancelled command.");
        default:
          const entry: Tags = new this.client.mongo.tags({
            guildID: message.guild.id,
            tagName: tagname.toLowerCase(),
            tagContent: response,
            author: message.author.id,
            createdAt: message.createdAt,
            usage_count: 0
          });
          entry
            .save()
            .then(() => message.success(`Successfully added tag ${tagname}.`))
            .catch(err =>
              message.error(
                `There was an error adding that tag.\n\`\`\`${err}\`\`\``
              )
            );
      }
    }
  }
}

import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { Tags } from "../../util/Mongo";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("tag.tagger", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "tag",
      description: "Shows a tag!",
      usage: "<tagname>",
      guildOnly: true,
      aliases: ["t"],
      requiredPerms: ["`tag.tagger`"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const tagname: string = args[0];
    if (!tagname) {
      const response: number | string = await message.sendPrompt(
        "What tag would you like to see?",
        30000
      );
      switch (response) {
        case undefined:
          return message.error("Time was up, so I cancelled the command.");
        case 0:
          return message.error("Cancelled command.");
        default:
          const tag: Tags = await this.client.mongo.tags.findOne({
            tagName: response,
            guildID: message.guild.id
          });
          if (tag) {
            tag.increment("usage_count");

            return message.send(tag.get("tagContent"));
          }

          return message.error(
            " Sorry, the tag you're looking for didn't exist."
          );
      }
    } else {
      const tag: Tags = await this.client.mongo.tags.findOne({
        tagName: tagname.toLowerCase(),
        guildID: message.guild.id
      });
      if (tag) {
        tag.increment("usage_count");
        message.delete().catch(() => 0);

        return message.send(tag.get("tagContent"));
      }
    }
  }
}

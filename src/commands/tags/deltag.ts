import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { Tags } from "../../util/Mongo";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("tag.tageditor", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "deltag",
      description: "Deletes a tag from the guild database.",
      guildOnly: true,
      usage: "<tagname>",
      requiredPerms: ["`tag.tageditor`"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const tagname: string = args[0];
    if (!tagname) {
      const response: string | number = await message.sendPrompt(
        "What tag would you like to delete?",
        30000
      );
      switch (response) {
        case undefined:
          return message.error("Time was up, so I cancelled the command.");
        case 0:
          return message.error("Cancelled command.");
        default:
          const tag: Tags = await Tags.findOne({
            guildID: message.guild.id,
            tagName: response
          });
          if (!tag) {
            return message.error("Sorry, that tag didn't exist.");
          }
          if (
            tag.get("author") !== message.author.id &&
            !message.guild.perms.check("tag.tageditor", message)
          ) {
            return message.error(
              " Silly you! You can only delete your own tags!"
            );
          }

          return tag
            .remove()
            .then(() =>
              message.success(
                `Successfully deleted the tag **${tag.get("tagName")}**.`
              )
            );
      }
    } else {
      const tag: Tags = await Tags.findOne({
        guildID: message.guild.id,
        tagName: tagname.toLowerCase()
      });
      if (!tag) {
        return message.error("Sorry, that tag didn't exist.");
      }
      if (
        tag.get("author") !== message.author.id &&
        !message.guild.perms.check("tag.tageditor", message)
      ) {
        return message.error(" Silly you! You can only delete your own tags!");
      }

      return tag
        .remove()
        .then(() =>
          message.success(`Successfully deleted the tag **${tagname}**.`)
        );
    }
  }
}

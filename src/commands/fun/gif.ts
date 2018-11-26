import { MessageEmbed } from "discord.js";
import giphy from "giphy-api";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {
  public static async run(
    message: FoxMessage,
    args: string[]
  ): Promise<FoxMessage> {
    const query: string = args.join(" ");
    if (!query) {
      return message.error(" Please specify a gif to search.");
    }
    const {
      data: { image_url: img }
    } = await giphy().random({
      tag: query,
      rating: "pg"
    });
    const embed: MessageEmbed = new MessageEmbed()
      .setImage(img)
      .setColor("RANDOM");

    return message.send({ embed });
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "gif",
      description: "Searches for a random gif from GIPHY.",
      usage: "<name>"
    });
  }
}

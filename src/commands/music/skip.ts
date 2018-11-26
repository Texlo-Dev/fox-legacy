import { GuildMember } from "discord.js";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.listen", message);
  }

  public static async run(message: FoxMessage): Promise<any> {
    const member: GuildMember = await message.guild.members.fetch(
      message.author
    );
    const serverQueue: Queue = message.guild.queue;
    if (!serverQueue) {
      return message.error(
        " Sorry, but there was nothing playing for me to skip."
      );
    }

    return serverQueue.skip(member);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "skip",
      description: "Skips to the next song in the queue.",
      guildOnly: true,
      requiredPerms: ["`music.listen`"]
    });
  }
}

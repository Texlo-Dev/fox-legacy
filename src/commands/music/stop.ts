import { GuildMember } from "discord.js";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.dj", message);
  }

  public static async run(message: FoxMessage): Promise<FoxMessage | void> {
    const member: GuildMember = await message.guild.members.fetch(
      message.author
    );
    if (!member.voice.channel) {
      return message.error(" You are not currently in a voice channel.");
    }
    const serverQueue: Queue = message.guild.queue;
    if (!serverQueue) {
      return message.error(" There is nothing playing for me to stop.");
    }
    await serverQueue.endAllSongs();
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "stop",
      description: "Stops all songs, and leaves the voicechannel.",
      aliases: ["stopplaying"],
      guildOnly: true,
      requiredPerms: ["`music.dj`"]
    });
  }
}

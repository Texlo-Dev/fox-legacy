import { GuildMember } from "discord.js";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.dj", message);
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

  public async run(message: FoxMessage): Promise<FoxMessage> {
    const member: GuildMember = await message.guild.members.fetch(
      message.author
    );
    if (!member.voice.channel) {
      return message.error(" You are not currently in a voice channel.");
    }
    const player: Queue = this.client.lavalink.players.get(message.guild.id)
      .queue;
    if (!player) {
      return message.error(
        "Sorry, but there was nothing playing for me to skip."
      ); // tslint:disable-line
    }

    return player.endAllSongs(message);
  }
}

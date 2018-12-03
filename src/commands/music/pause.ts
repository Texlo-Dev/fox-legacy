import { GuildMember, VoiceChannel } from "discord.js";
import { Player } from "lavalink";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.listen", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "pause",
      description: "Pauses the currently playing song.",
      guildOnly: true,
      requiredPerms: ["`music.listen`"]
    });
  }

  public async run(message: FoxMessage): Promise<any> {
    const player: Queue = this.client.music.players.get(message.guild.id)
      .queue;
    if (!player) {
      return message.error(
        "Sorry, but there was nothing playing for me to skip."
      ); // tslint:disable-line
    }

    return player.pause(message);
  }
}

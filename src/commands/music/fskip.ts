import { Player } from "lavalink";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.dj", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "fskip",
      description: "Forces the skipping of a song.",
      requiredPerms: ["`music.dj`"],
      guildOnly: true
    });
  }

  public async run(message: FoxMessage): Promise<FoxMessage> {
    const player: Player = this.client.music.players.get(message.guild.id);
    if (!player.queue) {
      return message.error(
        "Sorry, but there was nothing playing for me to skip."
      ); // tslint:disable-line
    }

    if (
      !message.member.voice.channel
    ) {
      // tslint:disable-line
      return message.error(
        "You need to be in the bot's voice channel to use this command."
      );
    }

    await player.queue.stop();
    player.emit("event", { reason: "FINISHED" });

    return message.send("Force skip successful.");
  }
}

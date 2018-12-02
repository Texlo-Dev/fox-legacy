import { GuildMember, VoiceChannel } from "discord.js";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.dj", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "volume",
      description: "Changes the volume of the currently playing song.",
      guildOnly: true,
      aliases: ["vol", "vvol"],
      usage: "<number>",
      patreonTier: 1,
      extendedUsage: { number: client.args.number },
      requiredPerms: ["music.dj"]
    });
  }

  public run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const amount: number = parseFloat(args[0]);
    if (!amount) {
      return message.send("Please specify a valid amount."); // tslint:disable-line
    }
    if (amount < 10 || amount > 200) {
      return message.error(
        "The supported volume percentage is 1-200, please try again."
      );
    }
    if (!message.guild.me.voice.channel) {
      return message.error("I must be in a voice channel first.");
    }

    const player: Queue = this.client.lavalink.players.get(message.guild.id)
      .queue;
    if (!player) {
      return message.error(
        "Sorry, but there was nothing playing for me to skip."
      ); // tslint:disable-line
    }

    return player.volume(amount, message);
  }
}

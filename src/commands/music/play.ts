import { GuildMember, Permissions, VoiceChannel } from "discord.js";
import { Command, FoxClient, FoxMusic } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("music.listen", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "play",
      description: "Plays some music from youtube.",
      usage: "[songname|link]",
      guildOnly: true,
      aliases: ["yt"],
      requiredPerms: ["`music.listen`"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const search: string = args.join(" ");
    if (!search) {
      return message.error("Please specify a song to play.");
    }
    const member: GuildMember = await message.guild.members.fetch(
      message.author
    );
    const music: FoxMusic = this.client.music;
    const voiceChannel: VoiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return message.error("Sorry, but you are not in a voice channel.");
    }
    const permissions: Readonly<
      Permissions
    > = member.voice.channel.permissionsFor(message.guild.me);
    if (!permissions.has("CONNECT")) {
      return message.error(
        "Sorry, but I do not have permissions to connect to this voice channel."
      );
    }
    if (!permissions.has("SPEAK")) {
      return message.error(
        "Sorry, but I do not have permissions to speak in this voice channel."
      );
    }

    return music.getID(search.replace(/<(.+)>/g, "$1"), message, member);
  }
}

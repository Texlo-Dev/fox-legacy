import {
  MessageEmbed,
  TextChannel,
  VoiceChannel,
  VoiceState
} from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "voiceStateUpdate",
      description: "Emitted when a user joins/leaves a voice channel."
    });
  }

  public async run(oState: VoiceState, nState: VoiceState): Promise<void> {
    const hasJoined: boolean = !oState.channel;
    const channel: VoiceChannel = oState.channel
      ? oState.channel
      : nState.channel;
    const guild: FoxGuild = channel.guild as FoxGuild;
    const enabled: boolean = guild.config.serverLogging;
    const log: TextChannel = guild.config.serverlogChannel;
    if (!enabled || !log || !channel.guild.channels.get(log.id)) {
      return;
    }
    if (guild.config.enabledEvents.indexOf(this.name) < 0) {
      return;
    }
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        hasJoined
          ? "Joined Voice Channel"
          : oState.channel && nState.channel
          ? "Changed Voice Channel"
          : "Left Voice Channel",
        channel.guild.client.user.displayAvatarURL({})
      ) // tslint:disable-line
      .setTimestamp()
      .setThumbnail(oState.member.user.displayAvatarURL())
      .setFooter(channel.guild.client.user.username)
      .setColor(this.client.brandColor)
      .setDescription(
        `
                **Member:** ${oState.member.user.tag}
                ${
                  oState.channel && nState.channel
                    ? `**Went From:** ${oState.channel.name}
                **To:** ${nState.channel.name}`
                    : `**Channel:** ${channel.name}`
                }`
      );
    const cl: TextChannel = guild.channels.get(log.id) as TextChannel;
    if (cl) {
      cl.send(embed);
    }
  }
}

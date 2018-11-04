import { MessageEmbed, VoiceState, TextChannel } from "discord.js";
import { Event } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "voiceStateUpdate",
            description: "Emitted when a user joins/leaves a voice channel."
        });
    }

    public async run(oState: VoiceState, nState: VoiceState) {
        const hasJoined = !oState.channel;
        const channel = oState.channel ? oState.channel : nState.channel;
        const guild = channel.guild as FoxGuild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !channel.guild.channels.get(log.id)) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const embed = new MessageEmbed()
            .setAuthor(hasJoined ? "Joined Voice Channel" : oState.channel && nState.channel ? "Changed Voice Channel" : "Left Voice Channel", channel.guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(oState.member.user.displayAvatarURL())
            .setFooter(channel.guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Member:** ${oState.member.user.tag}\n${oState.channel && nState.channel ? `**Went From:** ${oState.channel.name}\n**To:** ${nState.channel.name}` : `**Channel:** ${channel.name}`}`);
        const cl = guild.channels.get(log.id) as TextChannel;
        if (cl) cl.send(embed);

    }

}

import { MessageEmbed } from 'discord.js';
import { Event } from '../util';

export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'voiceStateUpdate',
            description: 'Emitted when a user joins/leaves a voice channel.'
        });
    }

    async run(oState, nState) {
        const hasJoined = !oState.channel;
        const channel = oState.channel ? oState.channel : nState.channel;
        const enabled = channel.guild.config.serverLogging;
        const log = channel.guild.config.serverlogChannel;
        if (!enabled || !log || !channel.guild.channels.get(log.id)) return;
        if (channel.guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const embed = new MessageEmbed()
            .setAuthor(hasJoined ? 'Joined Voice Channel' : oState.channel && nState.channel ? 'Changed Voice Channel' : 'Left Voice Channel', channel.guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(oState.member.user.displayAvatarURL())
            .setFooter(channel.guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Member:** ${oState.member.user.tag}\n${oState.channel && nState.channel ? `**Went From:** ${oState.channel.name}\n**To:** ${nState.channel.name}` : `**Channel:** ${channel.name}`}`);
        channel.guild.channels.get(log.id).send(embed);
    }

}


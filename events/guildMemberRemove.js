import { MessageEmbed } from 'discord.js';
import dateFormat from 'dateformat';
import { Event } from '../util';

export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'guildMemberRemove',
            description: 'Fires when a member leaves the server.'
        });
    }

    async run(member) {
        await this.checkAutoMute(member);
        this.handleGoodbyeMsg(member);

        const modlog = member.guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = member.guild.config.serverLogging;
        if (!enabled) return;
        if (member.guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const embed = new MessageEmbed()
            .setAuthor('Member Left', member.client.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`\n**Member Name:** ${member.user.tag}\n**ID:** ${member.id}\n**Joined At:** ${dateFormat(member.joinedAt)}`)
            .setTimestamp()
            .setColor(this.client.brandColor)
            .setFooter(member.client.user.username);
        const serverlog = member.guild.channels.get(modlog.id);
        if (!serverlog) return;
        serverlog.send({ embed });
    }

    async checkAutoMute(member) {
        if (member.guild.config.muteRole && member.roles.has(member.guild.config.muteRole.id)) {
            const query = await this.client.mongo.modactions.findOne({ guildID: member.guild.id, userID: member.id, isMute: true, hasLeft: false, automatic: true });
            query.set({ hasLeft: true });
            await query.save();
        } else {
            const query = await this.client.mongo.modactions.findOne({ guildID: member.guild.id, userID: member.id, isMute: true, hasLeft: true, automatic: true });
            if (query) {
                query.set({ hasLeft: false });
                await query.save();
            }
        }
    }

    async handleGoodbyeMsg(member) {
        const goodbyeEnabled = member.guild.config.goodbyeEnabled;
        const canEmbed = member.guild.config.goodbyeEmbed;
        const goodbyeMessage = member.guild.config.goodbyeMsg;
        const location = member.guild.config.goodbyeChannel;
        if (goodbyeEnabled && goodbyeMessage && goodbyeMessage.length && location.id) {
            const channel = member.guild.channels.get(location.id);
            if (channel && !canEmbed) {
                return channel.send(goodbyeMessage.replace(/{user}/g, `${member.user.tag}`));
            } else if (channel) {
                return channel.send(
                    new MessageEmbed()
                        .setColor('RANDOM')
                        .setTimestamp()
                        .setAuthor('Goodbye!', member.user.displayAvatarURL())
                        .setDescription(goodbyeMessage.replace(/{user}/g, `${member.user.tag}`))
                        .setFooter(this.client.user.username)
                );
            }
        }
    }

}

import dateFormat from 'dateformat';
const now = new Date();
dateFormat(now, 'dddd, mmmm dS, yyyy, h:MM:ss TT');
import { MessageEmbed } from 'discord.js';
const statuses = ['online', 'idle', 'dnd'];
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'serverinfo',
            description: 'Shows some information about the current server.',
            guildOnly: true,
            alaises: ['server-info', 'server-stats']
        });
    }

    run(message) {
        const millis = new Date().getTime() - message.guild.createdAt.getTime();
        const days = millis / 1000 / 60 / 60 / 24;
        const verificationLevels = ['None', 'Low', 'Medium', 'Insane'];
        const server = message.guild;

        const embed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor('Server Info', this.client.user.displayAvatarURL())
            .setTimestamp()
            .setThumbnail(server.iconURL || null)
            .addField('Server name:', server.name, true)
            .addField('Created on:', `${dateFormat(server.createdAt)}`, true)
            .addField('Days since creation:', `${days.toFixed(0)}`, true)
            .addField('Online/Total Members:', `${message.guild.members.filter(m => statuses.includes(m.presence.status)).size} / ${message.guild.memberCount}`, true)
            .addField('Channels:', `${server.channels.size}`, true)
            .addField('Region:', `${server.region}`, true)
            .addField('Owner:', `${server.owner.displayName}`, true)
            .addField('Roles:', `${server.roles.size}`, true)
            .addField('Shard #', this.client.shard.id, true)
            .addField('Verification Level:', `${verificationLevels[message.guild.verificationLevel]}`, true)
            .setFooter(`Guild ID: ${server.id}`);
        message.send({ embed });
    }

}

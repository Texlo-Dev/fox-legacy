import { MessageEmbed } from 'discord.js';
import { Event } from '../util';

export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'roleUpdate',
            description: 'Emitted when a role is updated.'
        });
    }

    async run(oRole, nRole) {
        const guild = oRole.guild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !guild.channels.get(log.id)) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const audit = await guild.fetchAuditLogs();
        const embed = new MessageEmbed()
            .setAuthor('Role Updated', guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(audit.entries.first().executor.displayAvatarURL())
            .setFooter(guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Old Role:** ${oRole}\n**New Role:** ${nRole}\n**Updated By:** ${audit.entries.first().executor.tag}`);
        guild.channels.get(log.id).send(embed);
    }

}


import { MessageEmbed } from 'discord.js';
import { Event } from '../util';
export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'guildMemberUpdate',
            description: 'Fires when a guilMember\'s details have changed.'
        });
    }

    async run(oMem, newMem) {
        const embed = new MessageEmbed()
            .setAuthor('Member Updated', newMem.client.user.displayAvatarURL())
            .setThumbnail(newMem.user.avatarURL())
            .setDescription(`\n**User:** ${newMem.user.tag}\n**Nickname:** ${newMem.nickname ? newMem.nickname : 'None'}\n**Roles:** ${newMem.roles.filter(f => f.id !== newMem.guild.id).map(r => r.name).join(', ') || 'None'}`)
            .setFooter(`ID: ${newMem.id}`)
            .setTimestamp()
            .setColor(0x96D036)
            .setFooter(newMem.client.user.username);
        const modlog = oMem.guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = oMem.guild.config.serverLogging;
        if (!enabled) return;
        if (oMem.guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const serverlog = oMem.guild.channels.get(modlog.id);
        if (!serverlog) return;
        serverlog.send({ embed });
    }

}

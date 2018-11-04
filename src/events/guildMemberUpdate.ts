import { MessageEmbed, GuildMember, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";
export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "guildMemberUpdate",
            description: "Fires when a guilMember's details have changed."
        });
    }

    public async run(oMem: GuildMember, newMem: GuildMember) {
        const embed = new MessageEmbed()
            .setAuthor("Member Updated", newMem.client.user.displayAvatarURL())
            .setThumbnail(newMem.user.avatarURL())
            .setDescription(`\n**User:** ${newMem.user.tag}\n**Nickname:** ${newMem.nickname ? newMem.nickname : "None"}\n**Roles:** ${newMem.roles.filter(f => f.id !== newMem.guild.id).map(r => r.name).join(", ") || "None"}`)
            .setFooter(`ID: ${newMem.id}`)
            .setTimestamp()
            .setColor(0x96D036)
            .setFooter(newMem.client.user.username);
        const guild = oMem.guild as FoxGuild;
        const modlog = guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = guild.config.serverLogging;
        if (!enabled) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const serverlog = oMem.guild.channels.get(modlog.id) as TextChannel;
        if (!serverlog) return;
        serverlog.send({ embed });
    }

}

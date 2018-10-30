import { MessageEmbed } from "discord.js";
import { Event } from "../util";

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "roleCreate",
            description: "Emitted when a role is created."
        });
    }

    public async run(role) {
        const guild = role.guild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !guild.channels.get(log.id)) return;
        if (role.guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const audit = await guild.fetchAuditLogs();
        const embed = new MessageEmbed()
            .setAuthor("Role Created", guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(audit.entries.first().executor.displayAvatarURL())
            .setFooter(guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Role:** ${role}\n**Creator:** ${audit.entries.first().executor.tag}`);
        guild.channels.get(log.id).send(embed);
    }

}

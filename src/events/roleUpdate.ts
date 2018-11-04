import { MessageEmbed, Role, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "roleUpdate",
            description: "Emitted when a role is updated."
        });
    }

    public async run(oRole: Role, nRole: Role) {
        const guild = oRole.guild as FoxGuild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !guild.channels.get(log.id)) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const audit = await guild.fetchAuditLogs();
        const embed = new MessageEmbed()
            .setAuthor("Role Updated", guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(audit.entries.first().executor.displayAvatarURL())
            .setFooter(guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Old Role:** ${oRole}\n**New Role:** ${nRole}\n**Updated By:** ${audit.entries.first().executor.tag}`);
        const channel = guild.channels.get(log.id) as TextChannel;
        if (channel) channel.send(embed);
    }

}

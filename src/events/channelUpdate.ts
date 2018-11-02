import { MessageEmbed } from "discord.js";
import { Event } from "../util";

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "channelUpdate",
            description: "Emitted when a channel is updated."
        });
    }

    public async run(oChannel, nChannel) {
        const guild = oChannel.guild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !guild.channels.get(log.id)) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const audit = await guild.fetchAuditLogs();
        const embed = new MessageEmbed()
            .setAuthor("Emoji Updated", guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(audit.entries.first().executor.displayAvatarURL())
            .setFooter(guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Old Channel:** ${oChannel}\n**New Channel:** ${nChannel}\n**Updated By:** ${audit.entries.first().executor.tag}`);
        guild.channels.get(log.id).send(embed);
    }

}

import { MessageEmbed } from "discord.js";
import { Event } from "../util";

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "emojiCreate",
            description: "Emitted when a emoji is created."
        });
    }

    public async run(emoji) {
        const guild = emoji.guild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !guild.channels.get(log.id)) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const audit = await guild.fetchAuditLogs();
        const embed = new MessageEmbed()
            .setAuthor("Emoji Created", guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(audit.entries.first().executor.displayAvatarURL())
            .setFooter(guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Emoji:** ${emoji} ${emoji.name}\n**Creator:** ${audit.entries.first().executor.tag}`);
        guild.channels.get(log.id).send(embed);
    }

}

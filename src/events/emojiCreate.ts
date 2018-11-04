import { MessageEmbed, GuildEmoji, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "emojiCreate",
            description: "Emitted when a emoji is created."
        });
    }

    public async run(emoji: GuildEmoji) {
        const guild = emoji.guild as FoxGuild;
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
        const ch = guild.channels.get(log.id) as TextChannel;
        if (ch) ch.send(embed);
    }

}

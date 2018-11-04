import { MessageEmbed, GuildChannel, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "channelDelete",
            description: "Emitted when a channel is deleted."
        });
    }

    public async run(channel: GuildChannel) {
        const guild = channel.guild as FoxGuild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !guild.channels.get(log.id)) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const audit = await guild.fetchAuditLogs();
        const embed = new MessageEmbed()
            .setAuthor("Channel Deleted", guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(audit.entries.first().executor.displayAvatarURL())
            .setFooter(guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Channel:** ${channel.name}\n**Deletor:** ${audit.entries.first().executor.tag}`);
        const ch = guild.channels.get(log.id) as TextChannel;
        if (ch) ch.send(embed);
    }

}

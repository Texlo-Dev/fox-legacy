import { MessageEmbed, Channel, GuildChannel, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "channelCreate",
            description: "Emitted when a channel is created."
        });
    }

    public async run(channel: GuildChannel): Promise<void> {
        const guild = channel.guild as FoxGuild;
        const enabled = guild.config.serverLogging;
        const log = guild.config.serverlogChannel;
        if (!enabled || !log || !guild.channels.get(log.id)) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const audit = await guild.fetchAuditLogs();
        const embed = new MessageEmbed()
            .setAuthor("Channel Created", guild.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setThumbnail(audit.entries.first().executor.displayAvatarURL())
            .setFooter(guild.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`\n**Channel:** ${channel}\n**Creator:** ${audit.entries.first().executor.tag}`);
        const cl = guild.channels.get(log.id) as TextChannel;
        if (cl) cl.send(embed);
    }

}

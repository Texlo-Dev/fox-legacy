import { Event, FoxClient } from "../util";
import { MessageEmbed, MessageStore, TextChannel } from "discord.js";
import { FoxMessage } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "messageDeleteBulk",
            description: "Message bulk delete event"
        });
    }

    public async run(msgs: MessageStore) {
        const message = msgs.first() as FoxMessage;
        const modlog = message.guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = message.guild.config.serverLogging;
        if (!enabled) return;
        const channelExclude = message.guild.config.logExcluded.some(c => c.id === message.channel.id);
        if (channelExclude) return;
        if (message.guild.config.enabledEvents.indexOf(this.name) < 0) return;

        const embed = new MessageEmbed()
            .setAuthor("Channel Purged", message.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setFooter(message.client.user.username)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setDescription(`\n**Purged by:** ${message.command.executor.tag}\n**Channel:** ${message.channel}\n**Purge Count**: ${msgs.size}\n**Archive Link**: ${await this.client.haste(msgs.map(m => `${m.member.displayName} - ${m.content}`).join("\n"), "bash")}`)
            .setFooter(message.client.user.username);
        if (!modlog) return;
        const serverlog = message.guild.channels.get(modlog.id) as TextChannel;
        if (!serverlog) return;
        serverlog.send({ embed });
    }

}

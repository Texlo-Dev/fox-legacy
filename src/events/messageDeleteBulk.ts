import { MessageEmbed, MessageStore, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxMessage } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "messageDeleteBulk",
            description: "Message bulk delete event",
        });
    }

    public async run(msgs: MessageStore): Promise<void> {
        const message: FoxMessage = msgs.first() as FoxMessage;
        const modlog: TextChannel = message.guild.config.serverlogChannel;
        if (!modlog) { return; }
        const enabled: boolean = message.guild.config.serverLogging;
        if (!enabled) { return; }
        const channelExclude: boolean = message.guild.config.logExcluded.some(c => c.id === message.channel.id);
        if (channelExclude) { return; }
        if (message.guild.config.enabledEvents.indexOf(this.name) < 0) { return; }

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor("Channel Purged", message.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setFooter(message.client.user.username)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setDescription(`

                **Purged by:** ${message.command.executor.tag}
                **Channel:** ${message.channel}
                **Purge Count**: ${msgs.size}
                **Archive Link**: ${await this.client.haste(msgs.map(m => `${m.member.displayName} - ${m.content}`).join("\n"), "bash")}` // tslint:disable-line
            )
            .setFooter(message.client.user.username);
        if (!modlog) { return; }
        const serverlog: TextChannel = message.guild.channels.get(modlog.id) as TextChannel;
        if (!serverlog) { return; }
        serverlog.send({ embed });
    }

}

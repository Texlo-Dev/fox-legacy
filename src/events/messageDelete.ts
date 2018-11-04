import { MessageEmbed, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxMessage } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "messageDelete",
            description: "Fired whenever a message is deleted in a channel."
        });
    }

    public async run(message: FoxMessage) {
        if (message.author === message.client.user) return;
        const modlog = message.guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = message.guild.config.serverLogging;
        if (!enabled) return;
        const channelExclude = message.guild.config.logExcluded.some(c => c.id === message.channel.id);
        if (channelExclude) return;
        if (message.guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const embed = new MessageEmbed()
            .setAuthor("Message Deleted", message.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setFooter(message.client.user.username)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setDescription(`\n**Channel:** ${message.channel}\n**Author:** ${message.author.tag}\n**Content:**\n${message.content}\n\n**Message ID:** ${message.id}`)
            .setFooter(message.client.user.username);
        if (!modlog) return;
        if (!serverlog) return;
        serverlog.send({ embed });
    }

}

import { MessageEmbed, TextChannel } from "discord.js";
import { invProtect, spamProtect, massProtect, badWords } from "../util/core/Automod";
import { Event, FoxClient } from "../util";
import { FoxMessage } from "../util/extensions";
const inviteRegex = new RegExp(/\b(?:https?:\/\/)?(?:www\.)?(?:discordapp\.com\/invite\/|discord\.gg\/)([\w-]{2,32})/gi);
export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "messageUpdate",
            description: "Fired when a message is updated in a server."
        });
    }

    public async run(oldMessage: FoxMessage, newMessage: FoxMessage) {
        if (oldMessage.content === newMessage.content) return;
        if (!oldMessage.guild) return;
        await this.initAutomod(newMessage);
        if (newMessage.editedTimestamp - oldMessage.createdTimestamp < 30000) newMessage.client.emit("message", newMessage);
        if (oldMessage.author.bot) return;
        const client = oldMessage.client;
        const modlog = oldMessage.guild.config.serverlogChannel;
        const enabled = oldMessage.guild.config.serverLogging;
        if (!enabled) return;
        const channelExclude = oldMessage.guild.config.logExcluded.some(c => c.id === oldMessage.channel.id);
        if (channelExclude) return;
        if (oldMessage.guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const embed = new MessageEmbed()
            .setAuthor("Message Updated", newMessage.client.user.displayAvatarURL({}))
            .setTimestamp()
            .setFooter(client.user.username)
            .setThumbnail(oldMessage.author.displayAvatarURL())
            .setColor(0xE0AD1A)
            .setDescription(`\n**Channel:** ${oldMessage.channel}\n**Author:** ${oldMessage.author.tag}\n**Old Message:**\n${oldMessage.content}\n**New message:**\n${newMessage.content}\n\n**Message ID:** ${oldMessage.id}`)
            .setFooter(oldMessage.client.user.username);
        if (modlog) {
            const serverlog = oldMessage.guild.channels.get(modlog.id) as TextChannel;
            if (!serverlog) return;
            serverlog.send({ embed });
        }
    }

    public async initAutomod(message: FoxMessage) {
        try {
            badWords(message);
            await invProtect(message);
            await massProtect(message);
            await spamProtect(message);
        } catch (error) {
            console.error(error);
        }
    }

}

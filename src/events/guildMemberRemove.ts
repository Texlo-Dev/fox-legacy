import { MessageEmbed, GuildMember, TextChannel } from "discord.js";
import dateFormat from "dateformat";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "guildMemberRemove",
            description: "Fires when a member leaves the server."
        });
    }

    public async run(member: GuildMember) {
        await this.checkAutoMute(member);
        this.handleGoodbyeMsg(member);
        const guild = member.guild as FoxGuild;
        const modlog = guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = guild.config.serverLogging;
        if (!enabled) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;
        const embed = new MessageEmbed()
            .setAuthor("Member Left", member.client.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`\n**Member Name:** ${member.user.tag}\n**ID:** ${member.id}\n**Joined At:** ${dateFormat(member.joinedAt)}`)
            .setTimestamp()
            .setColor(this.client.brandColor)
            .setFooter(member.client.user.username);
        const serverlog = member.guild.channels.get(modlog.id) as TextChannel;
        if (!serverlog) return;
        serverlog.send({ embed });
    }

    public async checkAutoMute(member: GuildMember): Promise<void> {
        const guild = member.guild as FoxGuild;
        if (guild.config.muteRole && member.roles.has(guild.config.muteRole.id)) {
            const query = await this.client.mongo.modactions.findOne({ guildID: guild.id, userID: member.id, isMute: true, hasLeft: false, automatic: true });
            query.set({ hasLeft: true });
            await query.save();
        } else {
            const query = await this.client.mongo.modactions.findOne({ guildID: guild.id, userID: member.id, isMute: true, hasLeft: true, automatic: true });
            if (query) {
                query.set({ hasLeft: false });
                await query.save();
            }
        }
    }

    public async handleGoodbyeMsg(member: GuildMember): Promise<any> {
        const guild = member.guild as FoxGuild;
        const goodbyeEnabled = guild.config.goodbyeEnabled;
        const canEmbed = guild.config.goodbyeEmbed;
        const goodbyeMessage = guild.config.goodbyeMsg;
        const location = guild.config.goodbyeChannel;
        if (goodbyeEnabled && goodbyeMessage && goodbyeMessage.length && location.id) {
            const channel = member.guild.channels.get(location.id) as TextChannel;
            if (channel && !canEmbed) {
                return channel.send(goodbyeMessage.replace(/{user}/g, `${member.user.tag}`));
            } else if (channel) {
                return channel.send(
                    new MessageEmbed()
                        .setColor("RANDOM")
                        .setTimestamp()
                        .setAuthor("Goodbye!", member.user.displayAvatarURL())
                        .setDescription(goodbyeMessage.replace(/{user}/g, `${member.user.tag}`))
                        .setFooter(this.client.user.username)
                );
            }
        }
    }

}

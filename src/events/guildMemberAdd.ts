import { MessageEmbed, GuildMember, TextChannel } from "discord.js";
import dateformat from "dateformat";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "guildMemberAdd",
            description: "Fires whenever a member joins a server."
        });
    }

    public async run(member: GuildMember) {
        const guild = member.guild;
        this.client.tools.checkIfMute(member);
        if (guild.id === "336211307541954560") {
            const ownerRole = guild.roles.find(role => role.name === "Server Owner");
            const ownerCheck = await this.client.shard.broadcastEval(`this.guilds.some(g => g.ownerID === '${member.id}')`);
            if (ownerCheck.some(bool => bool === true)) {
                member.roles.add(ownerRole);
            }
        }

        await this.welcomemsgHandle(member);
        this.handleAutoRole(member);
        this.handleLevelRoles(member);
        this.handleLog(member);
    }

    public async welcomemsgHandle(member: GuildMember): Promise<any> {
        const guild = member.guild as FoxGuild;
        const welcomeEnabled: boolean = guild.config.welcomeEnabled;
        const welcomeMessage: string = guild.config.welcomeMsg;
        const canEmbed: boolean = guild.config.welcomerEmbed;
        const location: any = guild.config.welcomeLocation;
        if (welcomeEnabled && welcomeMessage && welcomeMessage.length && location === "DM") {
            if (!canEmbed) member.send(welcomeMessage.replace(/{user}/g, `${member}`).replace(/{server}/g, `${member.guild}`).replace(/{position}/g, `${member.guild.memberCount}`)).catch(() => 0);
            else member.send(
                new MessageEmbed()
                    .setColor("RANDOM")
                    .setTimestamp()
                    .setAuthor("Welcome!", member.user.displayAvatarURL())
                    .setDescription(welcomeMessage.replace(/{user}/g, `${member}`).replace(/{server}/g, `${member.guild}`).replace(/{position}/g, `${member.guild.memberCount}`))
                    .setFooter(this.client.user.username)
            ).catch(() => 0);
        } else if (welcomeEnabled && welcomeMessage && location.id) {
            const channel = member.guild.channels.get(location.id) as TextChannel;
            if (channel && !canEmbed) { channel.send(welcomeMessage.replace(/{user}/g, `${member}`).replace(/{server}/g, `${member.guild}`).replace(/{position}/g, `${member.guild.memberCount}`)); } else {
                channel.send(
                    new MessageEmbed()
                        .setColor("RANDOM")
                        .setTimestamp()
                        .setAuthor("Welcome!", member.user.displayAvatarURL())
                        .setDescription(welcomeMessage.replace(/{user}/g, `${member}`).replace(/{server}/g, `${member.guild}`).replace(/{position}/g, `${member.guild.memberCount}`))
                        .setFooter(this.client.user.username)
                );
            }
        }
    }

    public async handleAutoRole(member: GuildMember): Promise<void> {
        const guild = member.guild as FoxGuild;
        const autoroles = guild.config.autoRoles;
        if (!autoroles || !autoroles.length) return;
        for (const autorole of autoroles) {
            const role = member.guild.roles.get(autorole.id);
            if (!role) continue;
            member.roles.add(role);
        }
    }

    public async handleLevelRoles(member: GuildMember): Promise<void> {
        const guild = member.guild as FoxGuild;
        const promoRoles = guild.leveling.promoRoles;
        const level = await guild.leveling.levelOf(member);
        const enabled = guild.packages.get("Leveling").enabled;
        if (!enabled || !promoRoles || !promoRoles.length || !level) return;
        const filtered = guild.leveling.stackRoles ? promoRoles.filter(p => p.rank <= level) : promoRoles.filter(p => p.rank === level);
        for (const role of filtered) {
            member.roles.add(role.id);
        }
    }

    public async handleLog(member: GuildMember): Promise<void> {
        const guild = member.guild as FoxGuild;
        const modlog = guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = guild.config.serverLogging;
        if (!enabled) return;
        if (guild.config.enabledEvents.indexOf(this.name) < 0) return;

        const embed = new MessageEmbed()
            .setAuthor("Member Joined", member.client.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`\n**Member Name:** ${member.user.tag}\n**ID:** ${member.id}\n**Account Created:** ${dateformat(member.user.createdAt)}`)
            .setTimestamp()
            .setColor(3534687)
            .setFooter(member.client.user.username);
        const serverlog = member.guild.channels.get(modlog.id) as TextChannel;
        if (!serverlog) return;
        serverlog.send({ embed });
    }

}

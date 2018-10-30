import { MessageEmbed } from "discord.js";
import dateformat from "dateformat";
import { Event } from "../util";

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "guildMemberAdd",
            description: "Fires whenever a member joins a server."
        });
    }

    public async run(member) {
        const guild = member.guild;
        const client = member.client;
        client.tools.checkIfMute(member);
        if (guild.id === "336211307541954560") {
            const ownerRole = guild.roles.find(role => role.name === "Server Owner");
            const ownerCheck = await client.shard.broadcastEval(`this.guilds.some(g => g.ownerID === '${member.id}')`);
            if (ownerCheck.some(bool => bool === true)) {
                member.roles.add(ownerRole);
            }
        }

        await this.welcomemsgHandle(member);
        this.handleAutoRole(member);
        this.handleLevelRoles(member);
        this.handleLog(member);
    }

    public async welcomemsgHandle(member) {
        const welcomeEnabled = member.guild.config.welcomeEnabled;
        const welcomeMessage = member.guild.config.welcomeMsg;
        const canEmbed = member.guild.config.welcomerEmbed;
        const location = member.guild.config.welcomeLocation;
        if (welcomeEnabled && welcomeMessage && welcomeMessage.length && location === "DM") {
            if (!canEmbed) return member.send(welcomeMessage.replace(/{user}/g, `${member}`).replace(/{server}/g, `${member.guild}`).replace(/{position}/g, `${member.guild.memberCount}`)).catch(() => 0);
            member.send(
                new MessageEmbed()
                    .setColor("RANDOM")
                    .setTimestamp()
                    .setAuthor("Welcome!", member.user.displayAvatarURL())
                    .setDescription(welcomeMessage.replace(/{user}/g, `${member}`).replace(/{server}/g, `${member.guild}`).replace(/{position}/g, `${member.guild.memberCount}`))
                    .setFooter(this.client.user.username)
            ).catch(() => 0);
        } else if (welcomeEnabled && welcomeMessage && location.id) {
            const channel = member.guild.channels.get(location.id);
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

    public async handleAutoRole(member) {
        const autoroles = member.guild.config.autoRoles;
        if (!autoroles || !autoroles.length) return;
        for (const autorole of autoroles) {
            const role = member.guild.roles.get(autorole.id);
            if (!role) continue;
            member.roles.add(role);
        }
    }

    public async handleLevelRoles(member) {
        const promoRoles = member.guild.leveling.promoRoles;
        const level = await member.guild.leveling.levelOf(member);
        const enabled = member.guild.packages.get("Leveling").enabled;
        if (!enabled || !promoRoles || !promoRoles.length || !level) return;
        const filtered = member.guild.leveling.stackRoles ? promoRoles.filter(p => p.rank <= level) : promoRoles.filter(p => p.rank === level);
        for (const role of filtered) {
            member.roles.add(role.id);
        }
    }

    public async handleLog(member) {
        const modlog = member.guild.config.serverlogChannel;
        if (!modlog) return;
        const enabled = member.guild.config.serverLogging;
        if (!enabled) return;
        if (member.guild.config.enabledEvents.indexOf(this.name) < 0) return;

        const embed = new MessageEmbed()
            .setAuthor("Member Joined", member.client.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`\n**Member Name:** ${member.user.tag}\n**ID:** ${member.id}\n**Account Created:** ${dateformat(member.user.createdAt)}`)
            .setTimestamp()
            .setColor(3534687)
            .setFooter(member.client.user.username);
        const serverlog = member.guild.channels.get(modlog.id);
        if (!serverlog) return;
        serverlog.send({ embed });
    }

}

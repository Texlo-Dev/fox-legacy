import { MessageEmbed, Collection } from "discord.js";

class ServerProtect {

    public constructor(guild, options = {}) {
        this.members = new Collection();
        this.maxwarn = options.maxwarn;
        this.maxban = options.maxban;
        this.client = guild.client;
        this.guild = guild;
    }

    public async warnMute(member, reason) {
        const muteRole = this.guild.config.muteRole;
        if (muteRole && member.roles.has(muteRole.id)) return;
        member.roles.add(muteRole.id).catch(() => 0);
        member.send(`I have detected a great amount of spam in your message(s), and I have muted you, as part of my spam protection package.`).catch(() => 0);

        const channel = await this.guild.config.modLogging;
        if (!channel) return;
        const modlog = await this.guild.config.modlogChannel;
        if (!modlog) return;
        const caseEntry = await this.client.mongo.modactions.count({ guildID: this.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        const embed = new MessageEmbed()
            .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
            .setColor("RANDOM")
            .setTimestamp()
            .setDescription(`**Action:** Automatic Mute\n**Member:** ${member.user.tag} (${member.id})\n**Reason:** *${reason}*`)
            .setFooter(`Case#${caseInt}`);
        const ch = this.guild.channels.get(modlog.id);
        const m = await ch.send({ embed }).catch(() => null);

        const entry = new this.client.mongo.modactions({
            guildID: this.guild.id,
            caseNum: caseInt,
            userID: member.user.id,
            action: "Automatic Mute",
            reasonFor: reason,
            modID: this.client.user.id,
            createdAt: m.createdAt,
            embedID: m ? m.id : null,
            isMute: true,
            hasLeft: true
        });
        await entry.save();
    }

    public async ban(member, reason) {
        await member.send(`Mention spam has been detected in your message, and you have been banned, as part of my spam protection package. If you feel like this was a mistake, DM ${member.guild.owner.user.tag}.`).catch(() => 0);
        member.ban({ days: 3, reason }).catch(() => 0);
        const channel = await this.guild.config.modLogging;
        if (!channel) return;
        const modlog = await this.guild.config.modlogChannel;
        if (!modlog) return;
        const caseEntry = await this.client.mongo.modactions.count({ guildID: this.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        const embed = new MessageEmbed()
            .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
            .setColor("RANDOM")
            .setTimestamp()
            .setDescription(`**Action:** Automatic Ban\n**Member:** ${member.user.tag} (${member.id})\n**Reason:** *${reason}*`)
            .setFooter(`Case#${caseInt}`);
        const ch = this.guild.channels.get(modlog.id);
        const m = await ch.send({ embed }).catch(() => null);

        const entry = new this.client.mongo.modactions({
            guildID: this.guild.id,
            caseNum: caseInt,
            userID: member.user.id,
            action: "Automatic Ban",
            reasonFor: reason,
            modID: this.client.user.id,
            createdAt: m.createdAt,
            embedID: m ? m.id : null
        });
        await entry.save();
    }

    public massRole(str) {
        const roleregex = /<@&?([0-9]+)>/g;
        const everyoneregex = /@everyone/g;
        return str.match(roleregex) ? str.match(roleregex) : str.match(everyoneregex);
    }

}

export default ServerProtect;

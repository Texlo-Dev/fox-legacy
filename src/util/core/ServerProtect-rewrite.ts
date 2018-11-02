import { MessageEmbed, Collection, Snowflake, GuildMember, TextChannel } from "discord.js";
import { FoxGuild } from "../extensions";
import { FoxClient } from "..";
import { ModActions } from "../Mongo";

interface ServerProtectOptions {
    maxwarn: number;
    maxban: number;
}

class ServerProtect {
    public members: Collection<Snowflake, any>;
    public maxwarn: number;
    public maxban: number;
    public readonly client: FoxClient;
    public readonly guild: FoxGuild;

    public constructor(guild: FoxGuild, options: ServerProtectOptions) {
        this.members = new Collection();
        this.maxwarn = options.maxwarn;
        this.maxban = options.maxban;
        this.client = guild.client;
        this.guild = guild;
    }

    public async warnMute(member: GuildMember, reason: string): Promise<void> {
        const muteRole: any = this.guild.config.muteRole;
        if (muteRole && member.roles.has(muteRole.id)) return;
        member.roles.add(muteRole.id).catch(() => 0);
        member.send(`I have detected a great amount of spam in your message(s), and I have muted you, as part of my spam protection package.`).catch(() => 0);

        const channel: boolean = await this.guild.config.modLogging;
        if (!channel) return;
        const modlog: any = await this.guild.config.modlogChannel;
        if (!modlog) return;
        const caseEntry: number = await this.client.mongo.modactions.count({ guildID: this.guild.id, id: undefined, warnpoints: undefined });
        const caseInt: number = caseEntry + 1;
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
            .setColor("RANDOM")
            .setTimestamp()
            .setDescription(`**Action:** Automatic Mute\n**Member:** ${member.user.tag} (${member.id})\n**Reason:** *${reason}*`)
            .setFooter(`Case#${caseInt}`);
        const ch = this.guild.channels.get(modlog.id) as TextChannel;
        const m = await ch.send({ embed }).catch(() => null);

        const entry: ModActions = new this.client.mongo.modactions({
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

    public async ban(member: GuildMember, reason: string): Promise<void> {
        await member.send(`Mention spam has been detected in your message, and you have been banned, as part of my spam protection package. If you feel like this was a mistake, DM ${member.guild.owner.user.tag}.`).catch(() => 0);
        member.ban({ days: 3, reason }).catch(() => 0);
        const channel: boolean = await this.guild.config.modLogging;
        if (!channel) return;
        const modlog: any = await this.guild.config.modlogChannel;
        if (!modlog) return;
        const caseEntry: number = await this.client.mongo.modactions.count({ guildID: this.guild.id, id: undefined, warnpoints: undefined });
        const caseInt: number = caseEntry + 1;
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
            .setColor("RANDOM")
            .setTimestamp()
            .setDescription(`**Action:** Automatic Ban\n**Member:** ${member.user.tag} (${member.id})\n**Reason:** *${reason}*`)
            .setFooter(`Case#${caseInt}`);
        const ch = this.guild.channels.get(modlog.id) as TextChannel;
        const m = await ch.send({ embed }).catch(() => null);

        const entry: ModActions = new this.client.mongo.modactions({
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

    public massRole(str: string): RegExpMatchArray {
        const roleregex = /<@&?([0-9]+)>/g;
        const everyoneregex = /@everyone/g;
        return str.match(roleregex) ? str.match(roleregex) : str.match(everyoneregex);
    }

}

export default ServerProtect;

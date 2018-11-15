import { MessageEmbed, GuildMember, TextChannel } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";
let id;

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("mod.kickboot", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "softban",
            description: "Kicks a user, and purges their messages.",
            usage: "<member> [reason]",
            extendedUsage: {
                member: client.args.member,
                reason: client.args.reason,
            },
            guildOnly: true,
            requiredPerms: ["`mod.kickboot`"],
        });
    }

    public async run(message: FoxMessage, args: string[], prefix: string): Promise<FoxMessage> {
        if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
            return message.error("I do not have the permission Ban Members to perform this operation.");
        }
        const member: GuildMember = await this.member(message.mentions.users.first() || args[0], message);
        if (!member) { return message.error(" Please mention a member to softban."); }
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.error(` Sorry, but you cannot perform moderation actions on ${member.displayName}.`);
        }
        let reason: string = args.slice(1)
        .join(" ");
        let modlog: TextChannel = message.guild.config.modlogChannel;
        const enabled: boolean = message.guild.config.modLogging;
        if (!enabled) { modlog = undefined; }

        const caseEntry: number = await this.client.mongo.modactions.count({
            guildID: message.guild.id,
            id: undefined,
            warnpoints: undefined
        });
        const caseInt: number = caseEntry + 1;
        if (!reason) { reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``; }
        if (message.guild.config.msgAfterMod) {
            await member.send(
                `You have been softbanned from **${message.guild.name}** with the reason of _${reason}_.
            `);
        }
        const mem: GuildMember = await member.ban({ days: 4 });
        id = mem.id;

        await message.guild.members.unban(id);
        const embed: MessageEmbed = new MessageEmbed()
            .setTimestamp()
            .setColor("RANDOM")
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Softban\n**Member:** ${mem.user.tag} (${mem.id})\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        message.send(`I have softbanned **${mem.user.tag}**, with the reason of **${reason}**. :ok_hand:`);
        const m: FoxMessage = modlog
            ? await (message.guild.channels.get(modlog.id) as TextChannel)
                .send({ embed }) as FoxMessage
            : undefined;
        const entry: ModActions = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: mem.id,
            modID: message.author.id,
            reasonFor: reason,
            embedID: m ? m.id : undefined,
            createdAt: message.createdAt,
            action: "Softban",
        });

        await entry.save();
    }

}

import { MessageEmbed, GuildMember, TextChannel, User } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("mod.banhammer", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "ban",
            description: "Bans a user from the guild.",
            usage: "<member> [reason]",
            extendedUsage: {
                member: client.args.member,
                reason: client.args.reason,
            },
            guildOnly: true,
            requiredPerms: ["`mod.banhammer`"],
        });
    }

    public async run(message: FoxMessage, args: string[], prefix: string): Promise<FoxMessage> {
        const user: string = args[0];
        let reason: string = args.slice(1)
            .join(" ");
        const member: GuildMember = await this.member(message.mentions.users.first() || user, message);
        if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
            return message.error("I do not have adequate permissions to perform this operation.");
        }
        if (!member) { return message.error("Value 'member' was not supplied, please try again."); }
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.error(`Sorry, but you cannot perform moderation actions on ${member.displayName}.`);
        }
        let modlog: TextChannel = message.guild.config.modlogChannel;
        const enabled: boolean = message.guild.config.modLogging;
        if (!enabled) { modlog = null; }

        const caseEntry: number = await this.client.mongo.modactions.count({
            guildID: message.guild.id,
            id: undefined, warnpoints: undefined
        });
        const caseInt: number = caseEntry + 1;
        if (!reason) { reason = `Moderator: Please type \`${prefix}reason ${caseInt} <reason>\``; }

        if (message.guild.config.msgAfterMod) {
            await member.send(`You have been banned from **${message.guild.name}** with the reason of _${reason}_.`); 
        }
        const banUser: User = await message.guild.members.ban(member, {
            days: 4,
            reason,
        })
        .catch(() => undefined);
        if (!banUser) { return message.reply("<:nicexmark:495362785010647041> Sorry, but I couldn't ban this user."); }

        const embed: MessageEmbed = new MessageEmbed()
            .setTimestamp()
            .setColor("RANDOM")
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Ban\n**Member:** ${(await this.client.users.fetch(member.id)).tag} (${member.id})\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        message.send(`I have banned **${(await this.client.users.fetch(member.id)).tag}**, with the reason of **${reason}**. :ok_hand:`);

        const m: FoxMessage = modlog ? await message.guild.channels.get(modlog.id).send({ embed }) : undefined;
        const entry: ModActions = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: banUser.id,
            modID: message.author.id,
            reasonFor: reason,
            createdAt: message.createdAt,
            embedID: m ? m.id : undefined,
            action: "Banned",
        });
        await entry.save();
    }

}

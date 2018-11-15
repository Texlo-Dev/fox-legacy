import { MessageEmbed, TextChannel, GuildMember } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("mod.kickboot", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "kick",
            description: "Kicks a user from the guild.",
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
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
            return message.error("Sorry, I don't have the proper permissions to perform this operation.");
        }
        let modlog: TextChannel = message.guild.config.modlogChannel;
        const enabled: boolean = message.guild.config.modLogging;
        if (!enabled) { modlog = undefined; }
        const caseEntry: number = await this.client.mongo.modactions.count({
            guildID: message.guild.id,
            id: undefined,
            warnpoints: undefined
        });
        const caseInt: number = caseEntry + 1;
        let reason: string = args.slice(1)
        .join(" ");
        const member: GuildMember = await this.member(message.mentions.users.first() || args[0], message);
        if (!member) { return message.error("Value 'member' was not supplied. Please try again."); }
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.error(`Sorry, but you cannot perform moderation actions on ${member.displayName}.`);
        }
        if (!reason) { reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``; }
        if (message.guild.config.msgAfterMod) {
            await member.send(`You have been kicked from **${message.guild.name}** with the reason of _${reason}_.`);
        }
        member.kick()
            .catch(err =>
            message.error(`I couldn't kick this user, most likely because they have a higher role than me, or they are the guild owner. ${err}`)); // tslint:disable-line

        const embed: MessageEmbed = new MessageEmbed()
            .setTimestamp()
            .setColor("RANDOM")
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Kick\n**Member:** ${member.user.tag} (${member.user.id})\n**Reason:** ${reason}`) // tslint:disable-line
            .setFooter(`Case#${caseInt}`);
        message.send(`I have kicked **${member.user.tag}**, with the reason **${reason}**. :ok_hand:`);
        const m: any = modlog
            ? await (message.guild.channels.get(modlog.id) as TextChannel).send({ embed })
            : undefined;
        const entry: ModActions = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: member.user.id,
            modID: message.author.id,
            reasonFor: reason,
            createdAt: message.createdAt,
            embedID: m ? m.id : undefined,
            action: "Kicked",
        });
        await entry.save();
    }

}

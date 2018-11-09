import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
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

    public hasPermission(message) {
        return message.guild.perms.check("mod.kickboot", message);
    }

    public async run(message, args, prefix) {
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) { return message.reply("Sorry, I don't have the proper permissions to perform this operation."); }
        let modlog = message.guild.config.modlogChannel;
        const enabled = message.guild.config.modLogging;
        if (!enabled) { modlog = null; }
        const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        let reason = args.slice(1).join(" ");
        const member = await this.member(message.mentions.users.first() || args[0], message);
        if (!member) { return message.error("Value 'member' was not supplied. Please try again."); }
        if (member.roles.highest.position >= message.member.roles.highest.position) { return message.error(`Sorry, but you cannot perform moderation actions on ${member.displayName}.`); }
        if (!reason) { reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``; }

        if (message.guild.config.msgAfterMod) { await member.send(`You have been kicked from **${message.guild.name}** with the reason of _${reason}_.`); }
        member.kick().catch(err => message.reply(`I couldn't kick this user, most likely because they have a higher role than me, or they are the guild owner. ${err}`));
        const embed = new MessageEmbed()
            .setTimestamp()
            .setColor("RANDOM")
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Kick\n**Member:** ${member.user.tag} (${member.user.id})\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        message.send(`I have kicked **${member.user.tag}**, with the reason **${reason}**. :ok_hand:`);
        const m = modlog ? await message.guild.channels.get(modlog.id).send({ embed }) : null;
        const entry = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: member.user.id,
            modID: message.author.id,
            reasonFor: reason,
            createdAt: message.createdAt,
            embedID: m ? m.id : null,
            action: "Kicked",
        });
        await entry.save();
    }

}

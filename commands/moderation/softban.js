import { MessageEmbed } from 'discord.js';
import { Command } from '../../util';
let id;

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'softban',
            description: 'Kicks a user, and purges their messages.',
            usage: '<member> [reason]',
            extendedUsage: {
                member: client.args.member,
                reason: client.args.reason
            },
            guildOnly: true,
            requiredPerms: ['`mod.kickboot`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('mod.kickboot', message);
    }

    async run(message, args, prefix) {
        if (!message.guild.me.hasPermission('BAN_MEMBERS')) return message.error(' I do not have the permission Ban Members to perform this operation.');
        const member = await this.member(message.mentions.users.first() || args[0], message);
        if (!member) return message.error(' Please mention a member to softban.');
        if (member.roles.highest.position >= message.member.roles.highest.position) return message.error(` Sorry, but you cannot perform moderation actions on ${member.displayName}.`);
        let reason = args.slice(1).join(' ');
        let modlog = message.guild.config.modlogChannel;
        const enabled = message.guild.config.modLogging;
        if (!enabled) modlog = null;

        const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        if (!reason) reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;
        if (message.guild.config.msgAfterMod) await member.send(`You have been softbanned from **${message.guild.name}** with the reason of _${reason}_.`);
        const mem = await member.ban({ days: 4 });
        id = mem.id;

        await message.guild.members.unban(id);
        const embed = new MessageEmbed()
            .setTimestamp()
            .setColor('RANDOM')
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Softban\n**Member:** ${mem.user.tag} (${mem.id})\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        message.send(`I have softbanned **${mem.user.tag}**, with the reason of **${reason}**. :ok_hand:`);
        const m = modlog ? await message.guild.channels.get(modlog.id).send({ embed }) : null;
        const entry = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: mem.id,
            modID: message.author.id,
            reasonFor: reason,
            embedID: m ? m.id : null,
            createdAt: message.createdAt,
            action: 'Softban'
        });

        await entry.save();
    }

}

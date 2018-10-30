import { MessageEmbed } from 'discord.js';
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'warn',
            description: 'Warns a user in a server.',
            usage: '<member> <points> [reason]',
            extendedUsage: {
                member: client.args.member,
                points: client.args.number,
                reason: client.args.reason
            },
            guildOnly: true,
            requiredPerms: ['`mod.warning`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('mod.warning', message);
    }

    async run(message, args, prefix) {
        let modlog = message.guild.config.modlogChannel;
        const enabled = message.guild.config.modLogging;
        if (!enabled) modlog = null;
        const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        let reason = args.slice(2).join(' ');
        const member = await this.member(message.mentions.users.first() || args[0], message);
        const points = parseFloat(args[1]);
        if (!member) return message.error('Value \'member\' was not supplied. Please try again.');
        if (member.roles.highest.position >= message.member.roles.highest.position) return message.error(`Sorry, but you cannot perform moderation actions on ${member.displayName}.`);
        if (!points) return message.error('Value \'points\' was not specifed.');
        if (!reason) reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;

        const dbEntry = await this.client.mongo.modactions.findOne({ guildID: message.guild.id, userID: member.id, action: undefined, id: undefined });
        const query = dbEntry;
        if (!query) {
            const newentry = new this.client.mongo.modactions({
                guildID: message.guild.id,
                userID: member.id,
                warnpoints: points
            });
            await newentry.save();
        } else {
            const current = dbEntry.get('warnpoints');
            query.set({ warnpoints: current + points });
            await query.save();
        }

        const embed = new MessageEmbed()
            .setTimestamp()
            .setColor('RANDOM')
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Warn\n**Member:** ${member.user.tag} (${member.user.id})\n**Points:** ${points}\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        message.send(`I have warned **${member.user.tag}**, with the reason of **${reason}**. :ok_hand:`);
        const m = modlog ? await message.guild.channels.get(modlog.id).send({ embed }) : null;
        const entry = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: member.user.id,
            modID: message.author.id,
            points,
            reasonFor: reason,
            createdAt: message.createdAt,
            embedID: m ? m.id : null,
            action: `Warned (${points} points)`
        });
        await entry.save();
        if (message.guild.config.msgAfterMod) await member.send(`You have been warned by **${message.author.username}** in ${message.guild.name} with the reason of _${reason}_. Your warning points have increased by **${points}**.`).catch(() => 0);

        const kickNum = message.guild.config.kickPoints;
        const banNum = message.guild.config.banPoints;
        if (!kickNum || !banNum) return message.send(`You have not set up autokick and autoban warning point amounts. To do so, use ${prefix}warnban and ${prefix}warnkick.`);
        const check = await this.client.mongo.modactions.findOne({ guildID: message.guild.id, userID: member.id, action: undefined, id: undefined });
        if (!check) return;
        const dbPoints = dbEntry ? dbEntry.get('warnpoints') : 0;
        let total = dbPoints + points;
        if (dbPoints === points) total = points;
        if (total >= banNum) {
            member.send(`You have exceeded the hard limit for warning points here, and have been banned from the server. All appeals should go to **${message.author.tag}**.`);
            member.ban({ days: 3 }).catch(() => 0);
        } else if (dbPoints <= kickNum && total >= kickNum) {
            await member.send(`You have exceeded the soft limit for warning points here, and have been kicked from the server. You are welcome to join again, but know that the next action is a ban.`);
            member.kick().catch(() => 0);
        }
    }

}

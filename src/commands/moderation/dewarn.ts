import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "dewarn",
            description: "Removes warning points from a user.",
            usage: "<member> <points> [reason]",
            extendedUsage: {
                member: client.args.member,
                points: client.args.member,
                reason: client.args.reason,
            },
            guildOnly: true,
            requiredPerms: ["`mod.warning`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("mod.warning", message);
    }

    public async run(message, args, prefix) {
        let modlog = await message.guild.config.modlogChannel;
        const enabled = await message.guild.config.modLogging;
        if (!enabled) { modlog = null; }
        const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        let reason = args.slice(2).join(" ");
        const member = await this.member(message.mentions.users.first() || args[0], message);
        const points = parseFloat(args[1]);
        if (!member) { return message.error("Value 'member' was not supplied. Please try again."); }
        if (member.roles.highest.position >= message.member.roles.highest.position) { return message.error(`Sorry, but you cannot perform moderation actions on ${member.displayName}.`); }
        const query = await this.client.mongo.modactions.findOne({ guildID: message.guild.id, userID: member.id, action: undefined, id: undefined });
        if (!query) { return message.error("This member has no warning points, so ignoring command."); }
        if (!points) { return message.error("Value 'points' was not specifed."); }
        if (query.get("warnpoints") < points) { return message.error("You cannot de-warn more warning points than the member has."); }
        if (!reason) { reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``; }

        const embed = new MessageEmbed()
            .setTimestamp()
            .setColor("RANDOM")
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** De-warn\n**Member:** ${member.user.tag} (${member.user.id})\n**Points:** ${points}\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        message.send(`Successfully de-warned **${member.user.tag}** :ok_hand:`);
        const m = message.guild.channels.get(modlog.id).send({ embed });
        const entry = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: member.user.id,
            modID: message.author.id,
            points,
            reasonFor: reason,
            createdAt: message.createdAt,
            embedID: m.id,
            action: `De-warned (${points} points)`,
        });
        await entry.save();

        const current = query.get("warnpoints");
        current - points !== 0 ? query.set({ warnpoints: current - points }) : query.remove();
        await query.save();
        if (message.guild.config.msgAfterMod) { await member.send(`You have been de-warned (${points} points) on **${message.guild.name}** with the reason of _${reason}_.`); }
    }

}

import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "unmute",
            description: "Unmutes a user who has been currently muted.",
            usage: "<member> [reason]",
            extendedUsage: {
                member: client.args.member,
                reason: client.args.reason,
            },
            guildOnly: true,
            requiredPerms: ["`mod.silencer`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("mod.silencer", message);
    }

    public async run(message, args, prefix) {
        if (!message.guild.me.hasPermission("MANAGE_ROLES")) { return message.error("Sorry, I do not have the permission Manage Roles to perform this operation."); }
        const member = await this.member(message.mentions.users.first() || args[0], message);

        if (!member) { return message.error("Value 'member' was not supplied, please try again."); }
        if (member.roles.highest.position >= message.member.roles.highest.position) { return message.error(`Sorry, but you cannot perform moderation actions on ${member.displayName}.`); }
        let reason = args.slice(2).join(" ");
        let modlog = message.guild.config.modlogChannel;
        const enabled = message.guild.config.modLogging;
        if (!enabled) { modlog = null; }

        const muteRole = message.guild.config.muteRole ? message.guild.roles.get(message.guild.config.muteRole.id) : null;
        if (!muteRole) { return message.error(`Sorry, but there isn't a mute role currently set. Please have the guild owner run \`${await message.guild.config.prefix}config muterole [nameofrole]\` to use this command.`); }
        if (!member.roles.has(muteRole.id)) { return message.send("This person is not currently muted, ignoring command.").then(m => m.delete({ timeout: 2000 })); }

        const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        if (!reason) { reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``; }

        const mem = await member.roles.remove(muteRole).catch(() => null);
        if (!mem) { return message.error("I don't have permissions to remove this role. Make sure that the role is below mine, and I have the Manage Role permission."); }
        const q = await this.client.mongo.modactions.findOne({ guildID: message.guild.id, userID: member.id, isMute: true });
        if (q) {
            q.set({ isMute: false });
            await q.save();
        }

        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTimestamp()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Unmute\n**Member:** ${mem.user.tag} (${mem.user.id})}\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        if (!modlog) { return message.send(`I have unmuted **${mem.user.tag}**, with the reason of **${reason}**. :ok_hand:`); }
        const m = modlog ? await message.guild.channels.get(modlog.id).send({ embed }) : null;

        const entry = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: mem.user.id,
            action: "Unmute",
            reasonFor: reason,
            modID: message.author.id,
            embedID: m ? m.id : null,
            createdAt: message.createdAt,
        });
        await entry.save();
    }

}

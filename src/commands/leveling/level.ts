import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "level",
            description: "Shows the leveling stats of you or another user.",
            usage: "[user]",
            guildOnly: true,
            aliases: ["level", "rank"],
            requiredPerms: ["`leveling.use`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("leveling.use", message);
    }

    public async run(message, args) {
        const member = await this.member(args[0], message);
        if (member) {
            const entry = await this.client.mongo.leveling.findOne({
                guildID: message.guild.id,
                userID: member.id,
            });
            if (!entry && member.user.bot) { return message.send("Sorry, bots aren't eligible for banking."); }
            if (!entry && !member.user.bot) { return message.send("That person hasn't started saving money yet. Try again later!"); }
            const embed = new MessageEmbed()
                .setAuthor(`${member.user.username}'s leveling stats`, `${member.user.displayAvatarURL()}`)
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`)
                .setDescription(stripIndents`
                **Level:** ${entry.get("level")}
                **Current XP/To Next Level:** ${entry.get("xp")}/${entry.get("tonextlevel")} (${entry.get("totalXP")} total)
                **Rank:** #${await message.guild.leveling.rankOf(member)} out of ${message.guild.memberCount} total members
                `);
            message.send({ embed });
        } else {
            const entry = await this.client.mongo.leveling.findOne({
                guildID: message.guild.id,
                userID: message.author.id,
            });
            if (!entry) { return message.reply("No bank account detected, so creating one now!").then(m => m.delete({ timeout: 2000 })); }
            const embed = new MessageEmbed()
                .setAuthor("Your Profile", `${message.author.displayAvatarURL()}`)
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`)
                .setDescription(stripIndents`
                **Level:** ${entry.get("level")}
                **XP/To Next Level:** ${entry.get("xp")}/${entry.get("tonextlevel")} (${entry.get("totalXP").toLocaleString()} total)
                **Rank:** #${await message.guild.leveling.rankOf(message.member)} out of ${message.guild.memberCount} total members
                `);
            message.send({ embed });
        }
    }

}

import { stripIndents } from "common-tags";
import { GuildMember, MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { FoxLeveling } from "../../util/Mongo";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("leveling.use", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "level",
      description: "Shows the leveling stats of you or another user.",
      usage: "[user]",
      guildOnly: true,
      aliases: ["level", "rank"],
      requiredPerms: ["`leveling.use`"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const member: GuildMember = await this.member(args[0], message);
    if (member) {
      const entry: FoxLeveling = await this.client.mongo.leveling.findOne({
        guildID: message.guild.id,
        userID: member.id
      });
      if (!entry && member.user.bot) {
        return message.send("Sorry, bots aren't eligible for banking.");
      }
      if (!entry && !member.user.bot) {
        return message.send(
          "That person hasn't started saving money yet. Try again later!"
        );
      }
      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor(
          `${member.user.username}'s leveling stats`,
          `${member.user.displayAvatarURL()}`
        )
        .setColor(this.client.brandColor)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
        .setDescription(stripIndents`
                **Level:** ${entry.get("level")}
                **Current XP/To Next Level:** ${entry.get("xp")}/${entry.get(
        "tonextlevel"
      )} (${entry.get("totalXP")} total)
                **Rank:** #${await message.guild.leveling.rankOf(
                  member
                )} out of ${message.guild.memberCount} total members
                `);

      return message.send({ embed });
    } else {
      const entry: FoxLeveling = await this.client.mongo.leveling.findOne({
        guildID: message.guild.id,
        userID: message.author.id
      });
      if (!entry) {
        return message
          .reply("No bank account detected, so creating one now!")
          .then(m => m.delete({ timeout: 2000 }));
      }
      const embed: MessageEmbed = new MessageEmbed()
        .setAuthor("Your Profile", `${message.author.displayAvatarURL()}`)
        .setColor(this.client.brandColor)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
        .setDescription(stripIndents`
                **Level:** ${entry.get("level")}
                **XP/To Next Level:** ${entry.get("xp")}/${entry.get(
        "tonextlevel"
      )} (${entry.get("totalXP").toLocaleString()} total)
                **Rank:** #${await message.guild.leveling.rankOf(
                  message.member
                )} out of ${message.guild.memberCount} total members
                `);
      return message.send({ embed });
    }
  }
}

import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("mod.warning", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "warn",
      description: "Warns a user in a server.",
      usage: "<member> <points> [reason]",
      extendedUsage: {
        member: client.args.member,
        points: client.args.number,
        reason: client.args.reason
      },
      guildOnly: true,
      requiredPerms: ["`mod.warning`"]
    });
  }

  public async run(message: FoxMessage, args: string[], prefix: string) {
    let modlog: string = message.guild.config.modlogChannel;
    const enabled: boolean = message.guild.config.modLogging;
    if (!enabled) {
      modlog = undefined;
    }
    const caseEntry: number = await ModActions.count({
      guildID: message.guild.id,
      id: undefined,
      warnpoints: undefined
    });
    const caseInt: number = caseEntry + 1;
    let reason: string = args.slice(2).join(" ");
    const member: GuildMember = await this.member(
      message.mentions.users.first() || args[0],
      message
    );
    const points: number = parseFloat(args[1]);
    if (!member) {
      return message.error(
        "Value 'member' was not supplied. Please try again."
      );
    }
    if (
      member.roles.highest.position >= message.member.roles.highest.position
    ) {
      return message.error(
        `Sorry, but you cannot perform moderation actions on ${
          member.displayName
        }.`
      );
    }
    if (!points) {
      return message.error("Value 'points' was not specifed.");
    }
    if (!reason) {
      reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;
    }

    const dbEntry: ModActions = await ModActions.findOne({
      guildID: message.guild.id,
      userID: member.id,
      action: undefined,
      id: undefined
    });
    const query: ModActions = dbEntry;
    if (!query) {
      const newentry: ModActions = new ModActions({
        guildID: message.guild.id,
        userID: member.id,
        warnpoints: points
      });
      await newentry.save();
    } else {
      const current: number = dbEntry.get("warnpoints");
      query.set({ warnpoints: current + points });
      await query.save();
    }

    const embed: MessageEmbed = new MessageEmbed()
      .setTimestamp()
      .setColor("RANDOM")
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(
        `**Action:** Warn
            **Member:** ${member.user.tag} (${member.user.id})
            **Points:** ${points}
            **Reason:** ${reason}
            `
      )
      .setFooter(`Case#${caseInt}`);
    message.send(
      `I have warned **${
        member.user.tag
      }**, with the reason of **${reason}**. :ok_hand:`
    );
    const m: any = modlog
      ? await (message.guild.channels.get(modlog.id) as TextChannel).send({
          embed
        })
      : undefined;
    const entry: ModActions = new ModActions({
      guildID: message.guild.id,
      caseNum: caseInt,
      userID: member.user.id,
      modID: message.author.id,
      points,
      reasonFor: reason,
      createdAt: message.createdAt,
      embedID: m ? m.id : undefined,
      action: `Warned (${points} points)`
    });
    await entry.save();
    if (message.guild.config.msgAfterMod) {
      await member
        .send(
          `You have been warned by **${message.author.username}** in ${
            message.guild.name
          } with the reason of _${reason}_. Your warning points have increased by **${points}**.`
        ) //tslint:disable-line
        .catch(() => 0);
    }

    const kickNum: number = message.guild.config.kickPoints;
    const banNum: number = message.guild.config.banPoints;
    if (!kickNum || !banNum) {
      return message.error(
        `You have not set up autokick and autoban warning point amounts. To do so, use ${prefix}warnban and ${prefix}warnkick.`
      ); // tslint:disable-line
    }
    const check: ModActions = await ModActions.findOne({
      guildID: message.guild.id,
      userID: member.id,
      action: undefined,
      id: undefined
    });
    if (!check) {
      return;
    }
    const dbPoints: number = dbEntry ? dbEntry.get("warnpoints") : 0;
    let total: number = dbPoints + points;
    if (dbPoints === points) {
      total = points;
    }
    if (total >= banNum) {
      member.send(
        `You have exceeded the hard limit for warning points here, and have been banned from the server. All appeals should go to **${
          message.author.tag
        }**.`
      ); // tslint:disable-line
      member.ban({ days: 3 }).catch(() => 0);
    } else if (dbPoints <= kickNum && total >= kickNum) {
      await member.send(
        "You have exceeded the soft limit for warning points here, and have been kicked from the server. You are welcome to join again, but know that the next action is a ban."
      ); // tslint:disable-line
      member.kick().catch(() => 0);
    }
  }
}

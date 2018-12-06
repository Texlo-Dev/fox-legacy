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
      name: "dewarn",
      description: "Removes warning points from a user.",
      usage: "<member> <points> [reason]",
      extendedUsage: {
        member: client.args.member,
        points: client.args.member,
        reason: client.args.reason
      },
      guildOnly: true,
      requiredPerms: ["`mod.warning`"]
    });
  }

  public async run(message: FoxMessage, args: string[], prefix: string) {
    let modlog: TextChannel = await message.guild.config.modlogChannel;
    const enabled: boolean = await message.guild.config.modLogging;
    if (!enabled) {
      modlog = null;
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
    const query: ModActions = await ModActions.findOne({
      guildID: message.guild.id,
      userID: member.id,
      action: undefined,
      id: undefined
    });
    if (!query) {
      return message.error(
        "This member has no warning points, so ignoring command."
      );
    }
    if (!points) {
      return message.error("Value 'points' was not specifed.");
    }
    if (query.get("warnpoints") < points) {
      return message.error(
        "You cannot de-warn more warning points than the member has."
      );
    }
    if (!reason) {
      reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;
    }

    const embed: MessageEmbed = new MessageEmbed()
      .setTimestamp()
      .setColor("RANDOM")
      .setAuthor("Member De-Warned.", this.client.user.displayAvatarURL())
      .addField("Member", `${member.user.tag} (${member.id})`, true)
      .addField("Points", points, true)
      .addField("Reason", reason, true)
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter(
        `Mod: ${message.author.tag} • Case#${caseInt} `,
        message.author.displayAvatarURL()
      );
    message.send(`Successfully de-warned **${member.user.tag}** :ok_hand:`);
    const m: any = await (message.guild.channels.get(
      modlog.id
    ) as TextChannel).send({ embed });
    const entry: ModActions = new ModActions({
      guildID: message.guild.id,
      caseNum: caseInt,
      userID: member.user.id,
      modID: message.author.id,
      points,
      reasonFor: reason,
      createdAt: message.createdAt,
      embedID: m.id,
      action: `De-warned (${points} points)`
    });
    await entry.save();

    const current: number = query.get("warnpoints");
    current - points !== 0
      ? query.set({ warnpoints: current - points })
      : query.remove();
    await query.save();
    if (message.guild.config.msgAfterMod) {
      await member.send(
        `You have been de-warned (${points} points) on **${
          message.guild.name
        }** with the reason of _${reason}_.`
      ); // tslint:disable-line
    }
  }
}

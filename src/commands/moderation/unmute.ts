import { GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("mod.silencer", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "unmute",
      description: "Unmutes a user who has been currently muted.",
      usage: "<member> [reason]",
      extendedUsage: {
        member: client.args.member,
        reason: client.args.reason
      },
      guildOnly: true,
      requiredPerms: ["`mod.silencer`"]
    });
  }

  public async run(message: FoxMessage, args: string[], prefix: string) {
    if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
      return message.error(
        "Sorry, I do not have the permission Manage Roles to perform this operation."
      );
    }
    const member: GuildMember = await this.member(
      message.mentions.users.first() || args[0],
      message
    );
    if (!member) {
      return message.error(
        "Value 'member' was not supplied, please try again."
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
    let reason: string = args.slice(2).join(" ");
    let modlog: TextChannel = message.guild.config.modlogChannel;
    const enabled: boolean = message.guild.config.modLogging;
    if (!enabled) {
      modlog = undefined;
    }

    const muteRole: Role = message.guild.config.muteRole
      ? message.guild.roles.get(message.guild.config.muteRole.id)
      : undefined;
    if (!muteRole) {
      return message.error(
        `Sorry, but there isn't a mute role currently set. Please have the guild owner run \`${await message
          .guild.config
          .prefix}config muterole [nameofrole]\` to use this command.`
      ); // tslint:disable-line
    }
    if (!member.roles.has(muteRole.id)) {
      return message
        .error("This person is not currently muted, ignoring command.")
        .then(mg => mg.delete({ timeout: 2000 }));
    }

    const caseEntry: number = await ModActions.count({
      guildID: message.guild.id,
      id: undefined,
      warnpoints: undefined
    });
    const caseInt: number = caseEntry + 1;
    if (!reason) {
      reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;
    }

    const mem: GuildMember = await member.roles
      .remove(muteRole)
      .catch(() => undefined);
    if (!mem) {
      return message.error(
        "I don't have permissions to remove this role. Make sure that the role is below mine, and I have the Manage Role permission."
      );
    } // tslint:disable-line
    const q: ModActions = await ModActions.findOne({
      guildID: message.guild.id,
      userID: member.id,
      isMute: true
    });
    if (q) {
      q.set({ isMute: false });
      await q.save();
    }

    const embed: MessageEmbed = new MessageEmbed()
      .setTimestamp()
      .setColor("RANDOM")
      .setAuthor("Member Unmuted.", this.client.user.displayAvatarURL())
      .addField("Member", `${mem.user.tag} (${mem.id})`, true)
      .addField("Reason", reason, true)
      .setThumbnail(mem.user.displayAvatarURL())
      .setFooter(
        `Acting Moderator: ${message.author.tag} • Case#${caseInt} `,
        message.author.displayAvatarURL()
      );
    if (!modlog) {
      return message.send(
        `I have unmuted **${
          mem.user.tag
        }**, with the reason of **${reason}**. :ok_hand:`
      );
    }
    const m: any = modlog
      ? await (message.guild.channels.get(modlog.id) as TextChannel).send({
          embed
        })
      : undefined;

    const entry: ModActions = new ModActions({
      guildID: message.guild.id,
      caseNum: caseInt,
      userID: mem.user.id,
      action: "Unmute",
      reasonFor: reason,
      modID: message.author.id,
      embedID: m ? m.id : undefined,
      createdAt: message.createdAt
    });
    await entry.save();
  }
}

import {
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  Role,
  TextChannel
} from "discord.js";
import { duration as _duration } from "moment";
import "moment-duration-format";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("mod.silencer", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "mute",
      description: "Mutes a user for a given time period, in minutes.",
      usage: "<member> <time> [reason]",
      extendedUsage: {
        member: client.args.member,
        duration: client.args.duration,
        reason: client.args.reason
      },
      guildOnly: true,
      aliases: ["silence"],
      requiredPerms: ["`mod.silencer`"]
    });
  }

  public async run(
    message: FoxMessage,
    args: string[],
    prefix: string
  ): Promise<FoxMessage> {
    if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
      return message.error(
        "Sorry, I do not have the permission Manage Roles to perform this operation."
      );
    }
    const member: GuildMember = await this.member(
      message.mentions.users.first() || args[0],
      message
    );
    const time: number = FoxClient.spanMs(args[1]);
    if (!member) {
      return message.error(
        "Value 'member' was not supplied, please try again."
      );
    }
    if (
      member.roles.highest
        ? member.roles.highest.position >= message.member.roles.highest.position
        : false
    ) {
      return message.error(
        `Sorry, but you cannot perform moderation actions on ${
          member.displayName
        }.`
      );
    }
    if (!time) {
      return message.error("Value 'time' was not supplied, please try again.");
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
        `Sorry, but there isn't a mute role currently set. Please have the guild owner run \`${
          message.guild.config.prefix
        }config muterole [nameofrole]\` to use this command.`
      ); // tslint:disable-line
    }
    if (member.roles.has(muteRole.id)) {
      return message
        .send("This person is already muted, ignoring command.")
        .then(mg => mg.delete({ timeout: 2000 }));
    }
    message.guild.channels.forEach(channel =>
      channel.createOverwrite(muteRole, {
        SEND_MESSAGES: false,
        ADD_REACTIONS: false
      })
    );

    const caseEntry: number = await ModActions.count({
      guildID: message.guild.id,
      id: undefined,
      warnpoints: undefined
    });
    const caseInt: number = caseEntry + 1;
    if (!reason) {
      reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;
    }
    const sendM: Message | Message[] = (await message.channel.send(
      "<a:typing:393848431413559296> Muting User."
    )) as Message;

    const mem: GuildMember = await member.roles
      .add(muteRole)
      .catch(() => undefined);
    if (!mem) {
      return sendM.edit(
        "<:nicexmark:495362785010647041> I don't have permissions to assign this role. Make sure that the role is below mine, and I have the Manage Role permission."
      ); // tslint:disable-line
    }

    const unmuteTime: number = Date.now() + time;
    const embed: MessageEmbed = new MessageEmbed()
      .setColor("RANDOM")
      .setTimestamp()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(
        `**Action:** Mute\n**Member:** ${mem.user.tag} (${
          mem.user.id
        })\n**Time:** ${_duration(time, "milliseconds").format(
          "d [days], h [hours], m [minutes]"
        )}\n**Reason:** ${reason}`
      ) // tslint:disable-line
      .setFooter(`Case#${caseInt}`);

    const m: Message | Message[] = modlog
      ? ((await (message.guild.channels.get(modlog.id) as TextChannel).send({
          embed
        })) as Message)
      : undefined;
    const entry: ModActions = new ModActions({
      guildID: message.guild.id,
      caseNum: caseInt,
      userID: mem.user.id,
      action: `Muted for ${_duration(time, "milliseconds").format(
        "d [days], h [hours], m [minutes]"
      )}`,
      reasonFor: reason,
      modID: message.author.id,
      time: unmuteTime,
      shard: this.client.shard.id,
      isMute: true,
      hasLeft: false,
      embedID: m ? m.id : undefined,
      createdAt: message.createdAt
    });
    await entry.save();
    sendM.edit(
      `I have muted **${
        mem.user.tag
      }**, with the reason of **${reason}**. :ok_hand:`
    );
    if (message.guild.config.msgAfterMod) {
      member
        .send(
          `You have been muted on **${message.guild.name}** for ${_duration(
            time,
            "milliseconds"
          ).format(
            "d [days], h [hours], m [minutes]"
          )}, with the reason of _${reason}_.`
        ) // tslint:disable-line
        .catch(() => 0);
    }
  }
}

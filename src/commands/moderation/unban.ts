import { MessageEmbed, TextChannel, User } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("mod.banhammer", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "unban",
      description: "Unbans a user form the guild, by ID.",
      usage: "<userID> [reason]",
      extendedUsage: {
        userID: "a user ID (ex: 485478489283938)",
        reason: client.args.reason
      },
      guildOnly: true,
      requiredPerms: ["`mod.banhammer`"]
    });
  }

  public async run(
    message: FoxMessage,
    args: string[],
    prefix: string
  ): Promise<FoxMessage> {
    if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
      return message.error(
        " I do not have the permission Ban Members to perform this operation."
      );
    }
    const id: string = args[0];
    let reason: string = args.slice(1).join(" ");
    if (!id) {
      return message.error(" Value 'id' was not specified, please try again.");
    }
    let modlog: TextChannel = message.guild.config.modlogChannel;
    const caseEntry: number = await this.client.mongo.modactions.count({
      guildID: message.guild.id,
      id: undefined,
      warnpoints: undefined
    });
    const caseInt: number = caseEntry + 1;
    if (!reason) {
      reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;
    }
    const enabled: boolean = message.guild.config.modLogging;
    if (!enabled) {
      modlog = undefined;
    }
    const banUser: User = await message.guild.members
      .unban(id)
      .catch(() => undefined);
    if (!banUser) {
      return message.send("Sorry, but that ID didn't work for me.");
    }

    const embed: MessageEmbed = new MessageEmbed()
      .setTimestamp()
      .setColor("RANDOM")
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(
        `**Action:** Unban\n**User:** ${
          (await this.client.users.fetch(id)).tag
        } (${id})\n**Reason:** ${reason}`
      ) // tslint:disable-line
      .setFooter(`Case#${caseInt}`);
    if (!modlog) {
      return message.send(
        `Successfully unbanned **${
          (await this.client.users.fetch(id)).tag
        }** :ok_hand:`
      );
    }
    const m: any = modlog
      ? await message.guild.channels.get(modlog.id).send({ embed })
      : undefined;
    const entry: ModActions = new this.client.mongo.modactions({
      guildID: message.guild.id,
      caseNum: caseInt,
      userID: id,
      modID: message.author.id,
      reasonFor: reason,
      embedID: m ? m.id : undefined,
      createdAt: message.createdAt,
      action: "Unban"
    });
    await entry.save();
  }
}

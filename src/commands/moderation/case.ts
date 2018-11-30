import dateFormat from "dateformat";
import { MessageEmbed, User } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";
dateFormat(new Date(), "ddd, mmm d, yyyy, at h MM TT");

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("mod.modcases", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "case",
      description: "Pulls up a mod incident, by number.",
      usage: "<number>",
      extendedUsage: { number: client.args.number },
      guildOnly: true,
      requiredPerms: ["`mod.modcases`"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    const num: number = parseFloat(args[0]);
    if (!num) {
      return message.error("Please specify a valid integer.");
    }
    const entry: ModActions = await ModActions.findOne({
      guildID: message.guild.id,
      caseNum: num
    });

    if (!entry) {
      return message.error("Oops! That case didn't exist.");
    }
    const id: string = entry.get("userID");
    const user: User = await this.client.users.fetch(id);
    const mod: User = await this.client.users
      .fetch(entry.get("modID"))
      .catch(() => undefined);
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        mod ? mod.tag : "Invalid User",
        mod ? mod.displayAvatarURL() : this.client.user.displayAvatarURL()
      )
      .setFooter(this.client.user.username)
      .setTimestamp()
      .setColor("RANDOM")
      .setTitle(`Case#${entry.get("caseNum")}`)
      .setDescription(
        `**Member:** ${user.tag} (ID: ${id})
            **Action:** ${entry.get("action")}
            **Reason:** ${entry.get("reasonFor")}
            **Date:** ${dateFormat(
              entry.get("createdAt"),
              "ddd mmm d, yyyy, 'at' h:MM TT Z"
            )}`
      );

    return message.send({ embed });
  }
}

import { MessageEmbed, Role } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("leveling.use", message);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "promoroles",
      description: "Shows all of the available promotion roles.",
      guildOnly: true,
      requiredPerms: ["`leveling.use`"]
    });
  }

  public async run(message: FoxMessage): Promise<FoxMessage> {
    const array: Role[] = message.guild.leveling.promoRoles;
    if (!array || !array.length) {
      return message.send("No leveling roles were found.");
    }
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(
        `All Promotion roles for ${message.guild.name}`,
        message.guild.iconURL()
      )
      .setColor(this.client.brandColor)
      .setTimestamp()
      .setFooter(this.client.user.username)
      .setDescription(
        array
          .map(
            r => `${message.guild.roles.get(r.id)}: Unlocked at Level ${r.rank}`
          )
          .join("\n") || "No roles were found." // tslint:disable-line
      );

    return message.send({ embed });
  }
}

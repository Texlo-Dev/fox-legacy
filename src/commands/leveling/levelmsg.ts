import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {
  public constructor(client) {
    super(client, {
      name: "levelmsg",
      description: "Shows or sets the current level up message.",
      usage: "[message]",
      guildOnly: true,
      requiredPerms: ["`leveling.manage`"]
    });
  }

  public hasPermission(message) {
    return message.guild.perms.check("leveling.manage", message);
  }

  public async run(message, args) {
    const enabled = message.guild.config.levelMessaging;
    if (!enabled) {
      return message.error(
        " Level up message are not enabled. please enable them before continuing."
      );
    }
    const m = args.join(" ");
    if (!m) {
      const embed = new MessageEmbed()
        .setAuthor("Level Up Message", this.client.user.displayAvatarURL())
        .setColor(this.client.brandColor)
        .setTimestamp()
        .setFooter(this.client.user.username)
        .setDescription(
          `Current level up message: ${
            (await message.guild.config.levelMsg)
              ? `"${await message.guild.config.levelMsg}"`
              : "None"
          }`
        );
      message.send({ embed });
    } else {
      await message.guild.config.set("levelMsg", m);
      const embed = new MessageEmbed()
        .setAuthor("Set Level Up Message", this.client.user.displayAvatarURL())
        .setColor(this.client.brandColor)
        .setTimestamp()
        .setFooter(this.client.user.username)
        .setDescription(
          ` <:check:314349398811475968> Successfully set Level Up message as "${m}"`
        );
      message.send({ embed });
    }
  }
}

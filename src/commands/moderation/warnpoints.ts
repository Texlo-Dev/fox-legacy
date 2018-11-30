import { MessageEmbed, User } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {
  public constructor(client: FoxClient) {
    super(client, {
      name: "warnpoints",
      description: "Shows your current warnpoints.",
      guildOnly: true,
      usage: "[member(warning permission only)]",
      requiredPerms: ["`mod.warning`"]
    });
  }

  public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
    let member: User = await this.user(args.join(" "), message);
    if (!message.guild.perms.check("mod.warning", message)) {
      member = undefined;
    }
    if (!member) {
      const query: ModActions = await ModActions.findOne({
        guildID: message.guild.id,
        userID: message.author.id,
        action: undefined,
        id: undefined
      });
      if (!query) {
        return message.send({
          embed: {
            author: {
              icon_url: this.client.user.displayAvatarURL(),
              name: "Warning Points"
            },
            description:
              "You have 0 warning points. Keep up the good behavior!",
            color: this.client.brandColor,
            timestamp: Date.now()
          }
        });
      } else {
        const warnpoints: number = query.get("warnpoints");
        const embed: MessageEmbed = new MessageEmbed()
          .setColor(this.client.brandColor)
          .setAuthor(
            this.client.user.username,
            this.client.user.displayAvatarURL()
          )
          .setDescription(
            `You have ${warnpoints} warning points. You are ${
              warnpoints < message.guild.config.kickPoints
                ? `${message.guild.config.kickPoints -
                    warnpoints} away from an automatic kick.`
                : `${message.guild.config.banPoints -
                    warnpoints} away from an automatic ban.`
            }`
          ) // tslint:disable-line
          .setTimestamp();

        return message.send({ embed });
      }
    } else {
      const query: ModActions = await ModActions.findOne({
        guildID: message.guild.id,
        userID: member.id,
        action: undefined,
        id: undefined
      });
      if (!query) {
        return message.send({
          embed: {
            author: {
              icon_url: this.client.user.displayAvatarURL(),
              name: "Warning Points"
            },
            description: `${
              member.username
            } has 0 warning points. Keep up the good behavior!`,
            color: this.client.brandColor,
            timestamp: Date.now()
          }
        });
      } else {
        const warnpoints: number = query.get("warnpoints");
        const embed: MessageEmbed = new MessageEmbed()
          .setColor(this.client.brandColor)
          .setAuthor(
            this.client.user.username,
            this.client.user.displayAvatarURL()
          )
          .setDescription(
            `${member.username} has ${warnpoints} warning points. They are ${
              warnpoints < message.guild.config.kickPoints
                ? `${message.guild.config.kickPoints -
                    warnpoints} away from an automatic kick.`
                : `${(await message.guild.config.banPoints) -
                    warnpoints} away from an automatic ban.`
            }`
          ) // tslint:disable-line
          .setTimestamp();

        return message.send({ embed });
      }
    }
  }
}

import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "warnpoints",
            description: "Shows your current warnpoints.",
            guildOnly: true,
            usage: "[member(warning permission only)]",
            requiredPerms: ["`mod.warning`"],

        });
    }

    public async run(message, args) {
        let member = await this.user(args.join(" "), message);
        if (!message.guild.perms.check("mod.warning", message)) { member = null; }
        if (!member) {
            const query = await this.client.mongo.modactions.findOne({ guildID: message.guild.id, userID: message.author.id, action: undefined, id: undefined });
            if (!query) {
                return message.send({
                    embed: {
                        author: {
                            icon_url: this.client.user.displayAvatarURL(),
                            name: "Warning Points",
                        },
                        description: "You have 0 warning points. Keep up the good behavior!",
                        color: this.client.brandColor,
                        timestamp: Date.now(),
                    },
                });
            } else {
                const warnpoints = query.get("warnpoints");
                const embed = new MessageEmbed()
                    .setColor(this.client.brandColor)
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                    .setDescription(`You have ${warnpoints} warning points. You are ${warnpoints < message.guild.config.kickPoints ? `${message.guild.config.kickPoints - warnpoints} away from an automatic kick.` : `${message.guild.config.banPoints - warnpoints} away from an automatic ban.`}`)
                    .setTimestamp();
                message.send({ embed });
            }
        } else {
            const query = await this.client.mongo.modactions.findOne({ guildID: message.guild.id, userID: member.id, action: undefined, id: undefined });
            if (!query) {
                return message.send({
                    embed: {
                        author: {
                            icon_url: this.client.user.displayAvatarURL(),
                            name: "Warning Points",
                        },
                        description: `${member.username} has 0 warning points. Keep up the good behavior!`,
                        color: this.client.brandColor,
                        timestamp: Date.now(),
                    },
                });
            } else {
                const warnpoints = query.get("warnpoints");
                const embed = new MessageEmbed()
                    .setColor(this.client.brandColor)
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                    .setDescription(`${member.username} has ${warnpoints} warning points. They are ${warnpoints < message.guild.config.kickPoints ? `${message.guild.config.kickPoints - warnpoints} away from an automatic kick.` : `${await message.guild.config.banPoints - warnpoints} away from an automatic ban.`}`)
                    .setTimestamp();
                message.send({ embed });
            }
        }
    }

}

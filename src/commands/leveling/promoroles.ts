import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "promoroles",
            description: "Shows all of the available promotion roles.",
            guildOnly: true,
            requiredPerms: ["`leveling.use`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("leveling.use", message);
    }

    public async run(message) {
        const array = message.guild.leveling.promoRoles;
        if (!array || !array.length) return message.send("No leveling roles were found.");
        const embed = new MessageEmbed()
            .setAuthor(`All Promotion roles for ${message.guild.name}`, message.guild.iconURL())
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setDescription(array.map(r => `${message.guild.roles.get(r.id)}: Unlocked at Level ${r.rank}`).join("\n") || "No roles were found.");
        message.send({ embed });
    }

}

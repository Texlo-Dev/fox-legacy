import { MessageEmbed } from "discord.js";
import dateFormat from "dateformat";
import { Command } from "../../util";
dateFormat(new Date(), "ddd, mmm d, yyyy, at h MM TT");

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "case",
            description: "Pulls up a mod incident, by number.",
            usage: "<number>",
            extendedUsage: { number: client.args.number },
            guildOnly: true,
            requiredPerms: ["`mod.modcases`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("mod.modcases", message);
    }

    public async run(message, args) {
        const number = parseInt(args[0]);
        if (!number) return message.error("Please specify a valid integer.");
        const entry = await this.client.mongo.modactions.findOne({
            guildID: message.guild.id,
            caseNum: number
        });

        if (!entry) return message.error("Oops! That case didn't exist.");
        const id = entry.get("userID");
        const user = await this.client.users.fetch(id);
        const embed = new MessageEmbed()
            .setAuthor((await this.client.users.fetch(entry.get("modID"))).tag, (await this.client.users.fetch(entry.get("modID"))).displayAvatarURL())
            .setFooter(this.client.user.username)
            .setTimestamp()
            .setColor("RANDOM")
            .setTitle(`Case#${entry.get("caseNum")}`)
            .setDescription(`**Member:** ${user.tag} (ID: ${id})\n**Action:** ${entry.get("action")}\n**Reason:** ${entry.get("reasonFor")}\n**Date:** ${dateFormat(entry.get("createdAt"), "ddd mmm d, yyyy, 'at' h:MM TT Z")}`);
        message.send({ embed });
    }

}

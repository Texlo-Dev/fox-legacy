import { Command } from "../../util";
import { MessageEmbed } from "discord.js";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "unban",
            description: "Unbans a user form the guild, by ID.",
            usage: "<userID> [reason]",
            extendedUsage: {
                userID: `a user ID (ex: 485478489283938)`,
                reason: client.args.reason
            },
            guildOnly: true,
            requiredPerms: ["`mod.banhammer`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("mod.banhammer", message);
    }

    public async run(message, args, prefix) {
        if (!message.guild.me.hasPermission("BAN_MEMBERS")) return message.error(" I do not have the permission Ban Members to perform this operation.");
        const id = args[0];
        let reason = args.slice(1).join(" ");
        if (!id) return message.error(" Value 'id' was not specified, please try again.");
        let modlog = message.guild.config.modlogChannel;
        const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined, warnpoints: undefined });
        const caseInt = caseEntry + 1;
        if (!reason) reason = `\nModerator: Please type \`${prefix}reason ${caseInt} <reason>\``;
        const enabled = message.guild.config.modLogging;
        if (!enabled) modlog = null;
        const banUser = await message.guild.members.unban(id).catch(() => null);
        if (!banUser) return message.send("Sorry, but that ID didn't work for me.");

        const embed = new MessageEmbed()
            .setTimestamp()
            .setColor("RANDOM")
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`**Action:** Unban\n**User:** ${(await this.client.users.fetch(id)).tag} (${id})\n**Reason:** ${reason}`)
            .setFooter(`Case#${caseInt}`);
        if (!modlog) return message.send(`Successfully unbanned **${(await this.client.users.fetch(id)).tag}** :ok_hand:`);
        const m = modlog ? await message.guild.channels.get(modlog.id).send({ embed }) : null;
        const entry = new this.client.mongo.modactions({
            guildID: message.guild.id,
            caseNum: caseInt,
            userID: id,
            modID: message.author.id,
            reasonFor: reason,
            embedID: m ? m.id : null,
            createdAt: message.createdAt,
            action: "Unban"
        });
        await entry.save();
    }

}

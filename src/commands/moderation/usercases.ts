import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "usercases",
            description: "Shows all cases for a user, or the whole server.",
            usage: "[member]",
            extendedUsage: { member: client.args.member },
            guildOnly: true,
            requiredPerms: ["`mod.modcases`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("mod.modcases", message);
    }

    public async run(message, args, prefix) {
        let page = parseInt(args[0]);
        if (!page) { page = 1; }
        const user = await this.user(message.mentions.users.first() || args[1], message);
        if (!user) {
            const query = await this.client.mongo.modactions.sort("caseNum", "asc").find({ guildID: message.guild.id });
            if (!query) { return message.reply("I couldn't find any recent cases."); }
            const mg = await message.send("<a:typing:393848431413559296> Loading all user cases....");
            const map = query.filter(q => q.get("caseNum") !== undefined);
            const paginated = this.client.paginate(map, page, 10);
            const embed = new MessageEmbed()
                .setTimestamp()
                .setColor(this.client.brandColor)
                .setAuthor("Moderation cases", this.client.user.displayAvatarURL())
                .setDescription(stripIndents`
                **All Moderation cases for ${message.guild.name}, Page ${paginated.page}:**

                ${(await Promise.all(paginated.items.map(async c => `**Case#${c.get("caseNum")} -** ${c.get("action")}\nMember: ${(await this.client.users.fetch(c.get("userID"))).tag}, Moderator: ${(await this.client.users.fetch(c.get("modID"))).tag}`))).join("\n\n") || "No recent cases for this user."}
                ${paginated.maxPage > 1 ? `\nType \`${prefix}usercases\` to view a specific page.` : ""}
                `);
            mg.edit({ embed });
        } else {
            const query = await this.client.mongo.modactions.sort("caseNum", "asc").find({ guildID: message.guild.id, userID: user.id });
            if (!query) { return message.reply("I couldn't find any recent cases for this user."); }
            const mg = await message.send(`<a:typing:393848431413559296> Loading all user cases for ${user.tag}....`);
            const map = query.filter(q => q.get("caseNum") !== undefined);
            const paginated = this.client.paginate(map, page, 10);
            const embed = new MessageEmbed()
                .setTimestamp()
                .setColor(this.client.brandColor)
                .setAuthor("Moderation cases", this.client.user.displayAvatarURL())
                .setDescription(stripIndents`
                **All Moderation cases for ${user.username}, Page ${paginated.page}:**

                ${(await Promise.all(paginated.items.map(async c => `**Case#${c.get("caseNum")} -** ${c.get("action")}\nMember: ${(await this.client.users.fetch(c.get("userID"))).tag}, Moderator: ${(await this.client.users.fetch(c.get("modID"))).tag}`))).join("\n\n") || "No recent cases for this user."}
                ${paginated.maxPage > 1 ? `Type \`${prefix}usercases [pagenumber]\` to view a specific page.` : ""}
                `);
            mg.edit({ embed });
        }
    }

}

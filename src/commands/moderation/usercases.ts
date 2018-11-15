import { stripIndents } from "common-tags";
import { MessageEmbed, Message } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage, FoxUser } from "../../util/extensions";
import { ModActions } from "../../util/Mongo";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("mod.modcases", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "usercases",
            description: "Shows all cases for a user, or the whole server.",
            usage: "[member]",
            extendedUsage: { member: client.args.member },
            guildOnly: true,
            requiredPerms: ["`mod.modcases`"],
        });
    }

    public async run(message: FoxMessage, args: string[], prefix: string) {
        let page: number = parseFloat(args[0]);
        if (!page) { page = 1; }
        const user: FoxUser = await this.user(message.mentions.users.first() || args[1], message) as FoxUser;
        if (!user) {
            const query: ModActions[] = await this.client.mongo.modactions.sort("caseNum", "asc")
            .find({
                guildID: message.guild.id
            });
            if (!query) { return message.reply("I couldn't find any recent cases."); }
            const mg: FoxMessage = await message.send("<a:typing:393848431413559296> Loading all user cases....");
            const map: ModActions[] = query.filter(q => q.get("caseNum") !== undefined);
            const paginated: any = FoxClient.paginate(map, page, 10);
            const embed: MessageEmbed = new MessageEmbed()
                .setTimestamp()
                .setColor(this.client.brandColor)
                .setAuthor("Moderation cases", this.client.user.displayAvatarURL())
                .setDescription(stripIndents`
                **All Moderation cases for ${message.guild.name}, Page ${paginated.page}:**

                ${(await Promise.all(paginated.items.map(async c => `**Case#${c.get("caseNum")} -** ${c.get("action")}\nMember: ${(await this.client.users.fetch(c.get("userID"))).tag}, Moderator: ${(await this.client.users.fetch(c.get("modID"))).tag}`))).join("\n\n") || "No recent cases for this user."}
                ${paginated.maxPage > 1 ? `\nType \`${prefix}usercases\` to view a specific page.` : ""}
                `);

            return mg.edit({ embed });
        } else {
            const query: ModActions[] = await this.client.mongo.modactions.sort("caseNum", "asc")
            .find({
                guildID: message.guild.id,
                userID: user.id
            });
            if (!query) { return message.reply("I couldn't find any recent cases for this user."); }
            const mg: FoxMessage = await message.send(
                `<a:typing:393848431413559296> Loading all user cases for ${user.tag}....`
            );
            const map: ModActions[] = query.filter(q => q.get("caseNum") !== undefined);
            const paginated: any = FoxClient.paginate(map, page, 10);
            const users: string[] = paginated.items.map(async usr => {
                // tslint:disable-next-line:no-shadowed-variable
                let user: any = await this.client.users.fetch(usr.get("userID"));
                user = user ? user.tag : "Unknown User";
                let mod: any = await this.client.users.fetch(usr.get("modID"));
                mod = mod ? mod.tag : "Unknown Moderator";

                return `**Case#${user.get("caseNum")} -** ${usr.get("action")}\nMember: ${user}, Moderator: ${mod}`;
            });
            const embed: MessageEmbed = new MessageEmbed()
                .setTimestamp()
                .setColor(this.client.brandColor)
                .setAuthor("Moderation cases", this.client.user.displayAvatarURL())
                .setDescription(stripIndents`
                **All Moderation cases for ${user.username}, Page ${paginated.page}:**

                ${(await Promise.all(users)).join("\n\n") || "No recent cases for this user."}
                ${paginated.maxPage > 1 ? `Type \`${prefix}usercases [pagenumber]\` to view a specific page.` : ""}
                `);

            return mg.edit({ embed });
        }
    }

}

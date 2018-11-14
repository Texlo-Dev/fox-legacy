/* eslint-disable no-constant-condition*/
import { MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage, FoxUser } from "../../util/extensions";
import { FoxLeveling } from "../../util/Mongo";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("leveling.use", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "leaderboard",
            description: "Shows the server rankings for leveling.",
            aliases: ["leader-board", "ranking", "lb"],
            requiredPerms: ["`leveling.use`"],
            guildOnly: true,
        });
    }

    public async run(message: FoxMessage, args: string[], prefix: string): Promise<FoxMessage> {
        const data: FoxLeveling[] = await this.client.mongo.leveling.sort({
            level: "desc", totalXP: "desc"
        })
        .find({ guildID: message.guild.id });
        const mapped: FoxLeveling[] = data.filter(d => d.get("level"))
            .map(c => c.get());
        let page: number = parseFloat(args[0]);
        if (!page) page = 1;
        const paginated: any = FoxClient.paginate(mapped, page, 10);
        let rank: number = (paginated.page - 1) * 10;
        const num: string[] = paginated.items.map(async mem => {
            const check: FoxUser = await this.client.users.fetch(mem.userID)
            .catch(() => undefined);

            return `**${++rank}.** Level ${mem.level} (${parseInt(mem.xp).toLocaleString()}) - ${check ? check.tag : 'Deleted user'}\n`; // tslint:disable-line
        });
        const str: string = `${(await Promise.all(num)).join(" ")}\n${paginated.maxPage > 1 ? `To see a specific page, just run ${prefix}leaderboard [pagenumber].` : ""}`; // tslint:disable-line
        const embed: MessageEmbed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setAuthor(`Leaderboard (pg. ${paginated.page})`, this.client.user.displayAvatarURL())
            .setFooter(this.client.user.username)
            .setDescription(str);

        return message.send({ embed });
    }

}

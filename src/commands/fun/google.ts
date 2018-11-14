import { AxiosResponse } from "axios";
import { load } from "cheerio";
import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import { parse } from "querystring";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {

    public constructor(client: FoxClient) {
        super(client, {
            name: "google",
            description: "Searches Google, with a provided search query.",
            usage: "<query>",
            aliases: ["g", "googlesearch"],
        });
    }

    public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const query: string = args.join(" ");
        const initmsg: FoxMessage = await message.send("<a:typing:393848431413559296> Searching...");
        if (!query) { return message.error(" Please specify something to search on Google."); }
        try {
            const data: AxiosResponse = await FoxClient.http("GET", {
                method: "GET",
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            });
            const $ = load(data);

            let googleURL: any = $(".r")
                .first()
                .find("a")
                .first()
                .attr("href");
            googleURL = parse(googleURL.replace("/url?", ""));
            const searchText: string = $(".st")
                .first()
                .text();
            const metadata: string = $(".r")
                .first()
                .text();
            initmsg.edit(
                new MessageEmbed()
                    .setColor(this.client.brandColor)
                    .setTimestamp()
                    .setAuthor("Google Search Results", this.client.user.displayAvatarURL())
                    .setFooter(this.client.user.username)
                    .setDescription(stripIndents`
                        [${metadata}](${googleURL.q})\n${searchText}
                    `),
            );
        } catch (error) {
            console.error(error);

            return initmsg.error("No results found.");
        }
    }

}

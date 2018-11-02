import { MessageEmbed } from "discord.js";
import { Command } from "../../util";
const giphy = require("giphy-api")();

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "gif",
            description: "Searches for a random gif from GIPHY.",
            usage: "<name>"
        });
    }

    public run(message, args) {
        const query = args.join(" ");
        if (!query) return message.error(" Please specify a gif to search.");
        giphy.random({
            tag: query,
            rating: "pg"
        }, (err, res) => {
            if (err) return message.send(`Hmm, there was an error with this command... \`${err.message}\``);
            const embed = new MessageEmbed()
                .setImage(res.data.image_url)
                .setColor("RANDOM");
            message.send({ embed });
        });
    }

}

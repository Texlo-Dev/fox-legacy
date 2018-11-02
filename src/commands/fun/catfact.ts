import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "catfact",
            description: "Displays a random catfact.",
            aliases: ["catfacts"],
            enabled: true
        });
    }

    public async run(message) {
        const snekfetch = require("snekfetch");
        const { body: { fact } } = await snekfetch.get("http://catfact.ninja/fact");
        message.send({ embed: { description: `:cat: ${fact}`, author: { icon_url: this.client.user.displayAvatarURL(), name: "Cat Fact" }, color: this.client.brandColor, timestamp: Date.now(), footer: this.client.user.username } });
    }

}

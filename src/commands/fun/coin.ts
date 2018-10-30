const possible = ["Heads", "Tails"];
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "coin",
            description: "Flips a coin!",
            alaises: ["flipcoin", "coinflip", "flip"]
        });
    }

    public run(message) {
        message.send({ embed: { description: `You flipped **${possible[Math.floor(Math.random() * possible.length)]}**.`, author: { icon_url: this.client.user.displayAvatarURL(), name: "Flip a Coin" }, color: this.client.brandColor, timestamp: Date.now(), footer: this.client.user.username } });
    }

}

import { MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public constructor(client: FoxClient) {
        super(client, {
            name: "ping",
            description: "Checks the ping to the Discord servers.",
        });
    }

    public async run(message: FoxMessage): Promise<void> {
        const pingmessage: FoxMessage = await message.send("Pinging....");
        const embed: MessageEmbed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor("Ping", this.client.user.displayAvatarURL())
            .setDescription(`:ping_pong: Pong! Message round-trip took **${pingmessage.createdTimestamp - message.createdTimestamp}ms**.\nClient ping is **${Math.round(this.client.ws.ping)}ms**.`); // tslint:disable-line
        pingmessage.edit({ embed });
    }

}

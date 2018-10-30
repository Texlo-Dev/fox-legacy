import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "ping",
            description: "Checks the ping to the Discord servers."
        });
    }

    public async run(message) {
        const pingmessage = await message.send("Pinging....");
        const embed = new (require("discord.js")).MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor("Ping", this.client.user.displayAvatarURL())
            .setDescription(`:ping_pong: Pong! Message round-trip took **${pingmessage.createdTimestamp - message.createdTimestamp}ms**.\nClient ping is **${Math.round(this.client.ping)}ms**.`);
        pingmessage.edit({ embed });
    }

}

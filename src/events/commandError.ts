import { MessageEmbed, WebhookClient } from "discord.js";
import { Event, FoxClient, FoxMessage } from "../util";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "commandError",
            description: "Run this when commands error."
        });
    }

    public run(message: FoxMessage, err: Error) {
        const embed = new MessageEmbed()
            .setAuthor("Command Error", message.client.user.displayAvatarURL())
            .setDescription(`There was an error executing this command: \n\`\`\`${message.client.isOwner(message.author.id) ? err.stack.split(",")[0] : err.message}\`\`\`\nThis error has been recorded.`)
            .setTimestamp()
            .setColor(this.client.brandColor)
            .setFooter(message.client.user.username);
        message.send({ embed });

        const webhook = new WebhookClient("489542923923226627", "C7j3qUi1_0cUz0nxRKmh9HXeing7Xj9HbjJ28G7hz2KYSnai_XDORuXvEQqSCazf1zWj");
        webhook.send("<@&336259383480680449>", {
            embeds: [
                new MessageEmbed()
                    .setAuthor("Command Errored", message.client.user.displayAvatarURL())
                    .setDescription(`**Command name:** ${message.command.name}
                    **Ran by:** ${message.author.tag}
                    **Server:** ${message.guild}
                    **Error Stack:**
                    \`\`\`${err.stack ? err.stack : err}\`\`\``)
                    .setTimestamp()
                    .setColor(this.client.brandColor)
                    .setFooter(message.client.user.username)
            ]
        });
    }

}

import { MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("ticket.create", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "tnew",
            description: "Create a new support ticket.",
            usage: "<topic>",
            requiredPerms: ["`ticket.create`"],
            guildOnly: true
        });
    }

    public async run(message: FoxMessage, [...topic]: string[]): Promise<FoxMessage> {
        return message.guild.tickets.add({ topic: topic.join(" ") }, message.author)
        .then(ticket => message.send(new MessageEmbed()
            .setColor(this.client.brandColor)
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL())
            .setAuthor(`${message.guild.name} Tickets`, message.guild.iconURL())
            .setDescription(
                `You have opened a new support ticket, check ${message.guild.channels.get(ticket.channel.id)}.`
            )
            .setTimestamp())
        )
        .catch(error => message.error(`There was an error creating this ticket. ${error}`));
    }
}

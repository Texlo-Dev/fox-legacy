import { MessageEmbed } from "discord.js";
import moment from "moment";
import { Command, FoxClient } from "../../util";
import { FoxMessage, FoxUser } from "../../util/extensions";
import Ticket from "../../util/tickets/Ticket";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("ticket.agent", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "tview",
            description: "Shows information about a ticket.",
            usage: "<ticket #>",
            requiredPerms: ["`ticket.view`"],
            guildOnly: true
        });
    }

    public async run(message: FoxMessage, [num]: string[]): Promise<FoxMessage> {
        const id: number = Number(num);
        if (!id) return message.error("Invalid number.");
        const ticket: Ticket = message.guild.tickets.get(id);
        if (!ticket) return message.error("This ticket does not exist.");
        const user: FoxUser = await this.user(ticket.author.id, message) as FoxUser;

        return message.send(new MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor(`Ticket ${ticket.id}`, message.guild.iconURL())
            .setThumbnail(user.displayAvatarURL())
            .addField("Author", user.tag, true)
            .addField("Topic", ticket.topic || "None", true)
            .addField(
                "Status",
                ticket.open ? "Open <:checkmark:495362807731060757>" : "Closed <:nicexmark:495362785010647041>",
                true
            )
            .addField("Support Agent(s)", ticket.agents.map(t => t.tag).join(", ") || "None", true)
            .addField("Created At", moment(ticket.createdAt).format("MMM Do YYYY, h:mm a"))
            .setFooter(`${this.client.user.username} Tickets`, this.client.user.displayAvatarURL())
            .setTimestamp()
        );
    }
}

import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import Ticket from "../../util/tickets/Ticket";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("ticket.agent", message);
    }

    public static run(message: FoxMessage, [num]: string[]): Promise<FoxMessage> {
        const id: number = Number(num);
        if (!id) return message.error("Invalid number.");
        const ticket: Ticket = message.guild.tickets.get(id);
        if (!ticket) return message.error("This ticket did not exist.");
        ticket.accept(message.author)
        .then(tkt =>
            message.success(`You have claimed Ticket #${tkt.id}, in ${message.guild.channels.get(tkt.channel.id)}.`))
        .catch(error => message.error(`There was an error while claiming this ticket. ${error.message}`));

    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "tclaim",
            description: "Claim an open support ticket.",
            usage: "<ticket #>",
            requiredPerms: ["`ticket.agent`"],
            guildOnly: true
        });
    }
}
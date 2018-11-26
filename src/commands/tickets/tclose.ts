import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import Ticket from "../../util/tickets/Ticket";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("ticket.agent", message);
  }

  public static run(message: FoxMessage, [id]: string): Promise<FoxMessage> {
    const num: number = Number(id);
    if (!num) return message.error("Invalid number.");
    const ticket: Ticket = message.guild.tickets.get(num);
    if (!ticket) return message.error("This ticket did not exist.");
    if (!ticket.agents.some(t => t.id === message.author.id))
      return message.error("You must claim this ticket in order to close it.");
    ticket
      .close()
      .then(() => message.success(`I have closed Ticket #${id}.`))
      .catch(error =>
        message.error(
          `There was an error while closing this ticket. ${error.message}`
        )
      );
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "tclose",
      description: "Closes an open support ticket.",
      usage: "<ticket #>",
      requiredPerms: ["`ticket.agent`"],
      guildOnly: true
    });
  }
}

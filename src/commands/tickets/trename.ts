import { MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import Ticket from "../../util/tickets/Ticket";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("ticket.create", message);
  }

  public static async run(
    message: FoxMessage,
    args: string[]
  ): Promise<FoxMessage> {
    const id: number = Number(args[0]);
    if (!id) return message.error("Invalid ticket number.");
    const ticket: Ticket = message.guild.tickets.get(id);
    if (!ticket) return message.error("This ticket does not exist.");
    const topic: string = args.slice(1).join(" ");
    if (!topic) return message.error("No topic was specified.");
    const isagent: boolean = ticket.agents.length
      ? ticket.agents.some(t => t.id === message.author.id)
      : ticket.author.id !== message.author.id;
    if (!isagent)
      return message.error("You are not authorized to edit this ticket.");

    return ticket
      .rename(topic)
      .then(tkt => message.success(`Successfully renamed Ticket #${tkt.id}.`))
      .catch(error =>
        message.error(`There was an error creating this ticket. ${error}`)
      );
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "trename",
      description: "Changes the topic of your support ticket.",
      usage: "<topic>",
      requiredPerms: ["`ticket.create`"],
      guildOnly: true
    });
  }
}

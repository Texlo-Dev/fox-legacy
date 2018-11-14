import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("giveaway.leader", message);
    }

    public static async run(message: FoxMessage, [...name]: string[]): Promise<FoxMessage> {
        if (!name.join(" ")) { return message.error(" Please specify a new giveaway to delete."); }
        if (!message.guild.giveaways.get(name.join(" "))) { return message.error(" This is not a valid giveaway."); }
        const m: FoxMessage = await message.send("<a:typing:393848431413559296> Deleting giveaway....");
        message.guild.giveaways.remove(name.join(" "))
            .then(() => m.edit("<:checkmark:495362807731060757> Successfully deleted the giveaway."))
            .catch(error =>
                m.edit(`<:nicexmark:495362785010647041> I could not delete this giveaway. ${error.message}`));
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "gwdelete",
            description: "Deletes a giveaway that has already ended from the history.",
            requiredPerms: ["`giveaway.leader`"],
            usage: "<name>",
        });
    }

}

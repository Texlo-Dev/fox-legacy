import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "gwdelete",
            description: "Deletes a giveaway that has already ended from the history.",
            requiredPerms: ["`giveaway.leader`"],
            usage: "<name>",
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("giveaway.leader", message);
    }

    public async run(message, [...name]) {
        if (!name.join(" ")) { return message.error(" Please specify a new giveaway to delete."); }
        if (!message.guild.giveaways.get(name.join(" "))) { return message.error(" This is not a valid giveaway."); }
        const m = await message.send("<a:typing:393848431413559296> Deleting giveaway....");
        message.guild.giveaways.delete(name.join(" "))
            .then(() => m.edit("<:checkmark:495362807731060757> Successfully deleted the giveaway."))
            .catch(error => m.edit(`<:nicexmark:495362785010647041> I could not delete this giveaway. ${error.message}`));
    }

}

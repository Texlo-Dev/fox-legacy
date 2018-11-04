import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "gwend",
            description: "Ends a currently running giveaway, and chooses a winner.",
            requiredPerms: ["`giveaway.leader`"],
            usage: "<name>"
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("giveaway.leader", message);
    }

    public async run(message, [...name]) {
        if (!name.join(" ")) return message.error(" Please specify a new giveaway to end.");
        if (!message.guild.giveaways.get(name.join(" "))) return message.error(" This is not a valid giveaway.");
        const m = await message.send("<a:typing:393848431413559296> Ending giveaway....");
        message.guild.giveaways.get(name.join(" ")).end()
            .then(() => m.edit("<:checkmark:495362807731060757> Successfully ended the giveaway."))
            .catch(error => m.edit(`<:nicexmark:495362785010647041> I could not end this giveaway. ${error.message}`));
    }

}

import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "gwreroll",
            description: "Picks a new winner for a giveaway that has already ended.",
            requiredPerms: ["`giveaway.leader`"],
            usage: "<name>",
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("giveaway.leader", message);
    }

    public async run(message, [...name]) {
        if (!name.join(" ")) { return message.error(" Please specify a new giveaway to reroll."); }
        if (!message.guild.giveaways.get(name.join(" "))) { return message.error(" This is not a valid giveaway."); }
        const m = await message.send("<a:typing:393848431413559296> Rerolling giveaway....");
        message.guild.giveaways.get(name.join(" ")).reroll()
            .then(() => m.edit("<:checkmark:495362807731060757> Successfully rerolled the giveaway."))
            .catch(error => m.edit(`<:nicexmark:495362785010647041> I could not reroll this giveaway. ${error.message}`));
    }

}

import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "listroles",
            description: "Shows all available self roles.",
            guildOnly: true,
            requiredPerms: ["`selfroles.use`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("selfroles.use", message);
    }

    public async run(message) {
        const roles = message.guild.config.selfRoles;
        if (!roles) { return message.error("  No available self roles."); }
        return message.FoxEmbed({ header: "Available Selfroles" }, roles.map(r => `${message.guild.roles.get(r.id)}`).join("\n"));
    }

}

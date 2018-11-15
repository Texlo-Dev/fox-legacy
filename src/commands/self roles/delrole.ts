import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { Role } from "discord.js";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("selfroles.use", message);
    }

    public static async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
            return message.error("I am missing the Manage Roles permissions, and therefore cannot remove roles.");
        }
        const role: Role = await Command.role(args.join(" "), message);
        if (!role) {
            return message.error("Invalid role detected.");
        }
        const entry: any[] = message.guild.config.selfRoles;
        if (!entry.some(r => r.id === role.id)) { return message.error(" This is not an available self role."); }
        message.member.roles.remove(role)
        .then(() => message.FoxEmbed({ header: "Remove Self Role" }, `You have removed the ${role} role.`))
        .catch(error => message.error(`I could not remove this role. ${error}`));
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "delrole",
            description: "Removed a selfrole you have assigned.",
            usage: "<rolename>",
            guildOnly: true,
            requiredPerms: ["`selfroles.use`"],
        });
    }

}

import { Role } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("selfroles.manage", message);
    }

    public static async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const role: Role = await this.role(args.join(" "), message);
        if (!role) { return message.error("Invalid role detected."); }
        const entry: any[] = message.guild.config.selfRoles;
        if (!entry.some(r => r.id === role.id)) { return message.error(" This self role does not exist."); }
        entry.splice(entry.indexOf(JSON.parse(JSON.stringify(role))), 1);
        message.guild.config.setArray("selfRoles", entry, true)
        .then(() => message.FoxEmbed(
            { header: "Delete Self Role" },
            `You deleted the ${role} role from the list of available selfroles.`
        ))
        .catch(error => message.error(`I could not perform this operation. ${error}`));
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "delrolename",
            description: "Deletes a role from the list of available selfroles.",
            usage: "<rolename>",
            guildOnly: true,
            requiredPerms: ["`selfroles.manage`"],
        });
    }

}

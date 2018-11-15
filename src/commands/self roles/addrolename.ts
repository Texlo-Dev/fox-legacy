import { Role } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("selfroles.manage", message);
    }

    public static async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const role: Role = await FoxCommand.role(args.join(" "), message);
        if (!role) { return message.error("Invalid role detected."); }
        const entry: any[] = message.guild.config.selfRoles;
        if (entry.some(r => r.id === role.id)) { return message.error(" This self role already exists."); }
        entry.push(JSON.parse(JSON.stringify(role)));
        message.guild.config.setArray("selfRoles", entry, true)
        .then(() =>
            message.FoxEmbed(
                { header: "Add New Self Role" },
                `You added to the ${role} role to the list of available selfroles.`
            ))
        .catch(error => message.error(`There was an error performing this operation. ${error}`));
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "addrolename",
            description: "Adds a role to the list of available selfroles.",
            usage: "<rolename>",
            guildOnly: true,
            requiredPerms: ["`selfroles.manage`"],
        });
    }

}

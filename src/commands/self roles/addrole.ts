import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "addrole",
            description: "Add a role from the available selfroles.",
            usage: "<rolename>",
            guildOnly: true,
            requiredPerms: ["`selfroles.use`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("selfroles.use", message);
    }

    public async run(message, args) {
        if (!message.guild.me.hasPermission("MANAGE_ROLES")) return message.error("I am missing the Manage Roles permissions, and therefore cannot assign roles.");
        const role = await this.role(args.join(" "), message);
        if (!role) return message.error("Invalid role detected.");
        const entry = message.guild.config.selfRoles;
        if (!entry.some(r => r.id === role.id)) return message.error(`This is not an available self role.`);
        message.member.roles.add(role);
        return message.FoxEmbed({ header: "Add Self Role" }, `You  have been added to the ${role} role.`);
    }

}

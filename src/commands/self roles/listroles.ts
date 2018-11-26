import { Role } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check("selfroles.use", message);
  }

  public static async run(message: FoxMessage): Promise<FoxMessage> {
    const roles: Role[] = message.guild.config.selfRoles;
    if (!roles) {
      return message.error("  No available self roles.");
    }

    return message.FoxEmbed(
      { header: "Available Selfroles" },
      roles.map(r => `${message.guild.roles.get(r.id)}`).join("\n") ||
        "No Self Roles added."
    );
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "listroles",
      description: "Shows all available self roles.",
      guildOnly: true,
      requiredPerms: ["`selfroles.use`"]
    });
  }
}

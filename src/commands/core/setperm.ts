// tslint:disable:no-magic-numbers
const scopes: string[] = ["user", "role", "everyone"];
import { Message } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {
  public constructor(client: FoxClient) {
    super(client, {
      name: "setperm",
      description: "Assigns a permission to a provided option.",
      usage: "<scope> <permission> <boolean> <target>",
      requiredPerms: ["`core.manageperm`"],
      guildOnly: true
    });
  }

  public hasPermission(message: FoxMessage): boolean {
    return (
      FoxClient.isOwner(message.author.id) ||
      message.guild.perms.check("core.manageperm", message)
    );
  }

  public async run(
    message: FoxMessage,
    args: string[]
  ): Promise<Message | Message[] | void> {
    const scope: string = args[0];
    if (!scope || scopes.indexOf(scope) < 0) {
      return message.error(
        `Invalid scope. Available scopes are ${scopes.join(", ")}`
      );
    }
    const perm: string = args[1];
    const bool: boolean = this.boolean(args[2]);
    if (!message.guild.permissions.has(perm)) {
      return message.channel.send("This permission does not exist.");
    }
    const target: any =
      scope === "user"
        ? await this.user(args.slice(3).join(" "), message)
        : scope === "everyone"
        ? { name: "@everyone", id: message.guild.id }
        : await Command.role(args.slice(3).join(" "), message);
    if (!target) {
      return message.error(
        "Invalid target specified. Must be valid user or role."
      );
    }
    message.guild.perms
      .add(perm, target, bool ? "allowed" : "denied")
      .then(() =>
        message.FoxEmbed(
          { header: "Set Permission" },
          `Permission \`${perm}\` for ${
            target.id === message.guild.id ? "Everyone are" : `${target} is`
          } now set to **${bool}**.`
        )
      ) // tslint:disable-line
      .catch(error =>
        message.error(`Error while adding this permission. ${error}`)
      );
  }
}

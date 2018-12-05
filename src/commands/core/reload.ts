import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isOwner(message.author.id);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "reload",
      description: "Reloads a command, if it has been changed.",
      usage: "<command>",
      requiredPerms: ["Bot Owner"]
    });
  }

  public async run(
    message: FoxMessage,
    args: string[]
  ): Promise<void | FoxMessage> {
    const command: string = args[0];
    if (!command) {
      return message.error("Please specify a command to reload.");
    }
    const cmd: Command = this.client.commands.get(command);
    if (!cmd) {
      return message.send(`I cannot find the command \`${command}\``);
    }
    const m: FoxMessage = await message.send(
      `Attempting to reload ${command}.`
    );
    cmd
      .reload()
      .then(() =>
        m.edit({
          embed: message.FoxEmbed({
            header: "Reload Command",
            description: `<:check:314349398811475968> Successfully reloaded the command **${
              cmd.name
            }**.`
          })
        })
      )
      .catch(e =>
        m.edit({
          embed: message.FoxEmbed(
            { header: "Reload Command" },
            `I failed to reload the command **${cmd.name}**.\nError: \`\`\`${
              e.stack
            }\`\`\``
          )
        })
      ); // tslint:disable-line

    if (this.client.shard) {
      await this.client.shard.broadcastEval(`
            const command = this.commands.get('${command}');
            if (this.shard.id !== ${this.client.shard.id}) command.reload();`);
    }
  }
}

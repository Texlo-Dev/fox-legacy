import { exec } from "child_process";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isOwner(message.author.id);
  }

  public static async run(
    message: FoxMessage,
    args: string[]
  ): Promise<void | FoxMessage> {
    const command: string = args.join(" ");
    if (!command) {
      return message.send({
        embed: { description: "Usage:\n`exec [command]`" }
      });
    }

    const runningMessage: string[] = [
      "`Running`",
      "```xl",
      clean(command),
      "```"
    ];
    const outMessage: FoxMessage = await message.send(runningMessage);
    const limit = 1750; //tslint:disable-line
    let stdOut: any = await doExec(command).catch(data =>
      outputErr(outMessage, data)
    );
    stdOut = stdOut.substring(0, limit);
    outMessage.channel.send(`\`Output\`
            \`\`\`sh
                ${clean(stdOut)}
            \`\`\``);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "exec",
      description: "Executes commands on my VPS (only for the bot owner, hehe)",
      usage: "<command>",
      aliases: ["sh", "sudo", "bash", "ex"],
      requiredPerms: ["Bot Owner"]
    });
  }
}

const clean: (text: string) => string = (text: string) => {
  const code = 8203; //tslint:disable-line
  if (typeof text === "string") {
    return text.replace("``", `\`${String.fromCharCode(code)}\``);
  } else {
    return text;
  }
};

const outputErr: (message: FoxMessage, stdData: any) => void = (
  msg: FoxMessage,
  stdData: any
) => {
  // tslint:disable-line
  let { stdout, stderr } = stdData;
  stderr = stderr
    ? ["`STDERR`", "```sh", clean(stderr.substring(0, 800)) || " ", "```"]
    : []; //tslint:disable
  stdout = stdout
    ? [
        "`STDOUT`",
        "```sh",
        clean(stdout.substring(0, stderr ? stderr.length : 2046 - 40)) || " ",
        "```"
      ]
    : [];
  const message: string = stdout
    .concat(stderr)
    .join("\n")
    .substring(0, 2000);
  msg.channel.send(`${message}`);
};

const doExec: (cmd: string, opts?: any) => Promise<string | void> = (
  cmd,
  opts = {}
) =>
  new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) {
        return reject({
          stdout,
          stderr
        });
      }
      resolve(stdout);
    });
  });

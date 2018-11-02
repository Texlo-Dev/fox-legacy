import { exec } from "child_process";
import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "exec",
            description: "Executes commands on my VPS (only for the bot owner, hehe)",
            usage: "<command>",
            aliases: ["sh", "sudo", "bash", "ex"],
            requiredPerms: ["Bot Owner"]
        });
    }

    public hasPermission(message) {
        return this.client.isOwner(message.author.id);
    }

    public async run(message, args) {
        const command = args.join(" ");
        if (!command) return message.send({ embed: { description: "Usage:\n`exec [command]`" } });

        const runningMessage = [
            "`Running`",
            "```xl",
            clean(command),
            "```"
        ];
        const outMessage = await message.send(runningMessage);
        let stdOut = await doExec(command).catch(data => outputErr(outMessage, data));
        stdOut = stdOut.substring(0, 1750);
        outMessage.channel.send(`\`Output\`
\`\`\`sh
${clean(stdOut)}
\`\`\``);
    }

}

const clean = (text) => {
    if (typeof text === "string") {
        return text.replace("``", `\`${String.fromCharCode(8203)}\``);
    } else {
        return text;
    }
};

const outputErr = (msg, stdData) => {
    let {
        stdout,
        stderr
    } = stdData;
    stderr = stderr ? ["`STDERR`", "```sh", clean(stderr.substring(0, 800)) || " ", "```"] : [];
    stdout = stdout ? ["`STDOUT`", "```sh", clean(stdout.substring(0, stderr ? stderr.length : 2046 - 40)) || " ", "```"] : [];
    const message = stdout.concat(stderr).join("\n").substring(0, 2000);
    msg.channel.send(`${message}`);
};

const doExec = (cmd, opts = {}) => new Promise((resolve, reject) => {
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

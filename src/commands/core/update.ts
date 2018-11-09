import { exec } from "child_process";
import { URL } from "url";
import { gitName, gitPass } from "../../config.json";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions/index.js";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.client.isDev(message.author.id);
    }

    public static async run(message: FoxMessage): Promise<void> {
        const gitURL: any = new URL("https://gitlab.com/rTexel/encipio.git");
        gitURL.password = gitPass;
        gitURL.username = gitName;
        message.channel.send("Updating Mr.Fox...")
        .then(m => {
            exec(`git pull ${gitURL} master`, async (err, stdout) => {
                if (err) { return m.edit(err.message.replace(new RegExp(gitURL), "NO U"), { code: "fix" }); }
                m.edit("Updated.");
                message.FoxEmbed({ header: "Update" }, `\`\`\`${stdout}\`\`\``).then(m => {
                    m.client.shard.broadcastEval("process.exit();");
                });
            });
        });
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "update",
            description: "Updates the bot, only for me.",
            requiredPerms: ["Bot Owner"],
        });
    }

}

import { exec } from "child_process";
import { MessageEmbed } from "discord.js";
import { version as tsversion } from "typescript";
import { URL } from "url";
import { gitName, gitPass } from "../../config.json";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions/index.js";

export default class FoxCommand extends Command {
  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isDev(message.author.id);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "update",
      description: "Updates the bot, only for me.",
      requiredPerms: ["Bot Owner"]
    });
  }

  public async run(message: FoxMessage): Promise<void> {
    const gitURL: any = new URL("https://gitlab.com/rTexel/encipio.git");
    gitURL.password = gitPass;
    gitURL.username = gitName;
    message.send("Updating Mr.Fox...").then(mg => {
      exec("cd ~/Fox; bash build.sh", (err, stdout) => {
        if (err) {
          return mg.edit(err.message.replace(new RegExp(gitURL), "NO U"), {
            code: "fix"
          });
        }
        mg.edit("Updated.");

        return message.send(
          new MessageEmbed()
            .setAuthor(`Update ${this.client.user.username}`)
            .setDescription(`\`\`\`${stdout}\`\`\`\nCompiling TypeScript.`)
            .setFooter(
              `Typescript version: ${tsversion}`,
              "https://raw.githubusercontent.com/remojansen/logo.ts/master/ts.png"
            )
        );
      });
    });
  }
}

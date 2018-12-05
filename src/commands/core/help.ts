//tslint:disable
import { Collection, MessageEmbed } from "discord.js";
import { Command, CustomCommand, FoxClient, Package } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public static checkPackages(message: FoxMessage): string[] {
    return message.guild.packages.filter(p => p.enabled).map(p => p.name);
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "help",
      description: "Shows all the available commands.",
      usage: "[command]",
      aliases: ["commands"]
    });
  }

  public async run(
    message: FoxMessage,
    args: string[],
    prefix: string
  ): Promise<void | FoxMessage> {
    const epkgs: string[] = FoxCommand.checkPackages(message);
    if (!args[0]) {
      let myCommands: Collection<string, Command>;
      const res: number = (await this.client.shard.broadcastEval(
        "this.guilds.size"
      )).reduce((prev, val) => prev + val, 0);
      /* if (message.guild) {
        const filtered: Collection<
          string,
          Command
        > = this.client.commands.filter(c =>
          c.category === "Core" ? true : epkgs.indexOf(c.category) > -1
        );
        myCommands = filtered
          .filter(c =>
            c.constructor.hasPermission
              ? c.constructor.hasPermission(message)
              : c.hasPermission(message)
          )
          .filter(able =>
            message.guild.config.disabledCommands
              ? message.guild.config.disabledCommands.indexOf(able.name) < 0
              : true
          );
        for (const c of message.guild.commands.values()) {
          if (!c.hasPermission(message)) {
            continue;
          }
          if (!c.enabled) {
            continue;
          }
          myCommands.set(c.name, c);
        }
      } else {
        myCommands = this.client.commands.filter(c => !c.guildOnly);
      }
      if (!myCommands.size) {
        return message.error(
          `No commands are enabled :sadpoop:\nEnable some packages with
                    \`${
                      message.guild
                        ? await message.guild.config.prefix
                        : this.client.commandPrefix
                    }enablepackage\`
                    to get started.
                `
        );
      } */
      let output = `
Welcome to ${
        this.client.user.username
      }, an easy-to-use, multipurpose Discord bot!
I am serving: **${res.toLocaleString()}** servers.
Command format for ${
        message.guild ? `this server` : "this DM"
      }: \`${prefix}<commandname>\`.
Command Count: **${this.client.commands.size}**.
[Add me to your server](https://mrfoxbot.xyz/servers) | [${
        this.client.user.username
      } support server](https://discord.gg/DfsqmaV) | [Donate to us!](https://www.patreon.com/user?u=7413177)
`;
      /* const categories: object = Array.from(myCommands.keys()).reduce(
        (prev, key) => {
          const command: Command = myCommands.get(key);
          if (!prev[command.category]) {
            prev[command.category] = [command.name];
          } else {
            prev[command.category].push(command.name);
          }

          return prev;
        },
        {}
      );

      const mess: string = Object.keys(categories).reduce(
        (prev, key) =>
          (prev += `**${key}:**\n${categories[key].join(", ")}\n\n`),
        ""
      ); //tslint:disable-line
      output += mess;*/
      const embed: MessageEmbed = new MessageEmbed()
        .setDescription(output)
        .setColor(this.client.brandColor)
        .addField(
          "Enabled Packages",
          message.guild.packages.size
            ? `
          ${message.guild.packages
            .filter(p => p.enabled)
            .map(p => p.name)
            .join(
              ", "
            )}\n\nTo view a package's commands, type \`${prefix}help <package>\`. Ex: \`f)help Moderation\`.
          `
            : "No packages enabled. Enable some packages on the dashboard :)"
        )
        .setAuthor(
          this.client.user.username,
          this.client.user.displayAvatarURL()
        );
      message.send({ embed }).catch(() => 0);
    } else if (
      message.guild.packages.has(this.client.capitalizeStr(args.join(" ")))
    ) {
      const pkg: Package = message.guild.packages.get(
        this.client.capitalizeStr(args.join(" "))
      );
      if (!pkg.enabled)
        return message.error(
          "Please enable this package to view its commands."
        );
      const filtered: Collection<string, Command> = pkg.commands
        .filter(c =>
          c.constructor.hasPermission
            ? c.constructor.hasPermission(message)
            : c.hasPermission(message)
        )
        .filter(able =>
          message.guild.config.disabledCommands
            ? message.guild.config.disabledCommands.indexOf(able.name) < 0
            : true
        );
      const embed: MessageEmbed = new MessageEmbed()
        .setTimestamp()
        .setColor(this.client.brandColor)
        .setAuthor(`${pkg.name} Package`, this.client.user.displayAvatarURL())
        .addField("Description", pkg.description);
      if (filtered.size) {
        embed.addField(
          "Commands",
          `${filtered
            .map(f => f.name)
            .sort()
            .join(", ") || "None"}

To view detailed command info, type \`${prefix}help <command>\`. Ex. \`f)help level\`
        `
        );
      }
      embed
        .addField(
          "Permissions",
          pkg.permissions.map(p => `\`${p.name}\``).join(", ") || "None"
        )
        .setFooter(this.client.user.username);

      return message.send({ embed });
    } else {
      const command: Command | CustomCommand =
        this.client.commands.get(args[0]) ||
        message.guild.commands.get(args[0]);
      if (command) {
        const embed: MessageEmbed = new MessageEmbed()
          .setTimestamp()
          .setAuthor(command.name, this.client.user.displayAvatarURL())
          .setColor(this.client.brandColor)
          .setFooter(this.client.user.username)
          .addField("Description", command.description, true);
        if (command.requiredPerms && command.requiredPerms.length) {
          embed.addField("Required Permissions", command.requiredPerms, true);
        }
        if (command.usage) {
          embed.addField("Usage", `${command.name} ${command.usage}`);
        }
        if (command.extendedUsage) {
          embed.addField(
            "Parameters",
            `
        ${Object.keys(command.extendedUsage)
          .map(o => `*${o}:* ${command.extendedUsage[o]}`)
          .join("\n    ")}

          <> = Required Argument. 
          [] = Optional Argument. 
          | = Separates Multiple Arguments.
          `,
            true
          );
        }

        return message.send({ embed });
      }
    }
  }
}

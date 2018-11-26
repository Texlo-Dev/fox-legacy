// tslint:disable:no-magic-numbers
import { Collection, TextChannel, GuildMember, Role } from "discord.js";
import { Command, Event, FoxClient, Package } from "../util";
import {
  badWords,
  invProtect,
  massProtect,
  spamProtect
} from "../util/core/Automod";
import { FoxMessage, FoxUser, FoxGuild } from "../util/extensions";
const tiers: object = {
  1: "**Bronze**",
  2: "Silver",
  3: "Gold"
};

export default class MessageEvent extends Event {
  public static async pkgInitialize(message: FoxMessage): Promise<void> {
    message.guild.leveling.listen(message);
    message.guild.banking.listen(message);
    try {
      await Promise.all([
        badWords(message),
        invProtect(message),
        massProtect(message),
        spamProtect(message),
        this.checkOwner(message)
      ]);
    } catch (error) {
      console.error(error);
    }
  }

  public static regExpEsc(str: string): string {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  private static async checkOwner(message: FoxMessage): Promise<void> {
    const guild: FoxGuild = message.guild;
    if (guild.id !== "336211307541954560") return;

    const member: GuildMember = await guild.members.fetch(message.author.id);
    const client: FoxClient = guild.client as FoxClient;
    const ownerRole: Role = guild.roles.find(
      role => role.name === "Server Owner"
    );
    if (ownerRole) {
      if (client.user.id === "334841053276405760") {
        return;
      }
      const ownerCheck: any[] = await client.shard.broadcastEval(
        `this.guilds.some(g => g.ownerID === '${member.id}')`
      );
      if (ownerCheck.some(bool => bool === true)) {
        if (!member.roles.has(ownerRole.id)) {
          member.roles.add(ownerRole);
        }
      } else if (member.roles.has(ownerRole.id)) {
        member.roles.remove(ownerRole);
      }
    }
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "message",
      description: "Fires when a message is sent in a server."
    });
  }

  public async run(
    message: FoxMessage
  ): Promise<void | boolean | FoxMessage | FoxMessage[]> {
    if (message.author.bot) {
      return;
    }
    if (
      message.guild &&
      !message.channel.permissionsFor(message.guild.me)
      .has("SEND_MESSAGES")
    ) {
      return;
    }
    if (message.guild) {
      await MessageEvent.pkgInitialize(message);
    }
    const commandPrefix: string = message.guild
      ? message.guild.config.prefix
      : this.client.commandPrefix;
    const prefix: RegExpExecArray = new RegExp(
      `^<@!?${this.client.user.id}> |^${MessageEvent.regExpEsc(
        commandPrefix || "f)"
      )}`
    ).exec(message.content); // tslint:disable-line
    if (!prefix) {
      return;
    }
    const args: string[] = message.content
      .slice(prefix[0].length)
      .trim()
      .split(/ +/g);
    const command: Command = this.client.commands.get(
      args.shift()
      .toLowerCase()
    );
    if (!command) {
      return this.client.emit("unknownCommand", message);
    }
    message._registerCommand(command);

    const user: FoxUser = message.author;
    if (!user.upvoter) {
      await user._setUpvoter();
    }
    if (typeof user.patreonTier !== "number") {
      await user._setTier();
    }
    if (command.guildOnly && !message.guild) {
      return message.send(
        "Sorry, this command can only be ran in a guild channel."
      );
    } else if (
      message.guild.config.disabledCommands
        ? message.guild.config.disabledCommands.indexOf(command.name) > -1
        : undefined
    ) {
      return message.error(
        " This command has been disabled by the server administrator."
      );
    }
    const pkg: Package = message.guild.packages.get(command.category);
    if (!pkg.enabled)
      return message.error(
        `The **${this.client.capitalizeStr(
          command.category
        )}** package is currently disabled.`
      );
    else if (
      pkg.patreonTier > (message.guild.owner.user as FoxUser).patreonTier
    )
      return message.error(
        `This package requires that ${
          message.guild.ownerID === message.author.id
            ? `you have at least the ${
                tiers[pkg.patreonTier.toString()]
              } Patreon tier to use. Check out our various patreon plans and perks here: https://www.patreon.com/join/foxdevteam?`
            : `your server owner has the the ${
                tiers[pkg.patreonTier.toString()]
              } Patreon tier to use. If you want to use this package immediately, choose your patreon tier today, and get some cool rewards. https://www.patreon.com/join/foxdevteam` // tslint:disable-line
        }
            `
      );
    else if (
      typeof command.hasPermission === "function" &&
      !command.hasPermission(message)
    ) {
      return message.error(
        " _**Sorry, but you do not have permission to use this command.**_"
      );
    } else if (
      typeof command.constructor.hasPermission === "function" &&
      !command.constructor.hasPermission(message)
    ) {
      return message.error(
        " _**Sorry, but you do not have permission to use this command.**_"
      );
    }

    if (!this.client.commands.cooldowns.has(command.name)) {
      this.client.commands.cooldowns.set(command.name, new Collection());
    }
    const now: number = Date.now();
    const timestamps: Collection<
      string,
      number
    > = this.client.commands.cooldowns.get(command.name);
    const cooldownAmount: number = (command.cooldown || 0) * 1000;

    if (!timestamps.has(message.author.id)) {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } else {
      const expirationTime: number =
        timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft: number = (expirationTime - now) / 1000;
        return message.error(
          `You must wait ${require("moment")
            .duration(timeLeft, "seconds")
            .format(
              "h [hours], m [minutes and] s [seconds]"
            )} before using this command again.`
        ); // tslint:disable-line
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
      this.client.commandsRun++;
      command._registerExecutor(message);
      if (
        command.category === "Moderation" &&
        message.guild.config.delModCmds
      ) {
        message.delete()
        .catch(() => 0);
      }
      // @ts-ignore
      if (command.constructor.run) {
        return command.constructor.run(message, args, prefix);
      } else {
        return command.run(message, args, commandPrefix);
      }
    } catch (error) {
      this.client.emit("commandError", message, error);
    }
  }
}

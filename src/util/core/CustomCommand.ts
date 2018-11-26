import { Message } from "discord.js";
import { CustOptions } from "../../types";
import { FoxGuild, FoxMessage } from "../extensions";
import { CustomCommands } from "../Mongo";

export default class CustomCommand {
  public args: any;
  public category: string;
  public cooldown: number;
  public deleteCommand: boolean;
  public description: string;
  public dmCommand: boolean;
  public enabled: boolean;
  public guild: FoxGuild;
  public guildID: string;
  public name: string;
  public requiredPerms: string;
  public template: string;
  public usage: string;

  public constructor(guild: FoxGuild, data: CustOptions) {
    Object.defineProperty(this, "guild", { value: guild, writable: false });
    this.name = data.name;
    this.guildID = data.guildID;
    this.enabled = data.enabled;
    this.category = data.category;
    this.cooldown = data.cooldown;
    this.description = data.description || "A Custom Command.";
    this.dmCommand = data.dmCommand;
    this.deleteCommand = data.deleteCommand;
    this.requiredPerms = data.requiredPerms;
    this.usage = data.usage || "None";
    this.template = data.template || "Beep.";
    this.args = data.args || {};
  }

  public async edit(data: any): Promise<CustomCommand[]> {
    const command: CustomCommands = await this.guild.client.mongo.customcommands.findOne(
      {
        guildID: this.guild.id,
        name: this.name
      }
    );
    if (!command) {
      throw new Error("Command not found in database.");
    }
    for (const key in data) {
      if (this.hasOwnProperty(key)) {
        command.set({ [key]: data[key] });
      } else {
        throw new Error(`Invalid keu: ${key}`);
      }
    }
    await command.save();
    await this.guild.commands.reloadAll();

    return this.guild.commands.array();
  }

  public async execute(message: FoxMessage): Promise<Message | Message[]> {
    let template: string = this.template;
    for await (const variable of Object.keys(this.guild.commands.variables)) {
      const rgx: RegExp = new RegExp(`{${variable}}`, "gi");
      if (!rgx.test(template)) {
        continue;
      }
      template = template.replace(
        rgx,
        this.guild.commands.variables[variable](message)
      );
    }
    const regex: RegExp = new RegExp("{(.*?)}", "gm");
    template = await this.parseActions(message, template, regex, 1);
    if (this.deleteCommand) {
      message.delete();
    }

    return this.dmCommand
      ? message.author.send(template)
      : message.channel.send(template);
  }

  public hasPermission(message: FoxMessage): boolean {
    return message.guild.perms.check(this.requiredPerms, message);
  }

  public async parseActions(
    message: FoxMessage,
    str: string,
    regex: RegExp,
    index: number
  ): Promise<any> {
    index || (index = 1); /* tslint:disable-line */
    const matches: string[] = [];
    let match: any;
    while ((match = regex.exec(str))) {
      /* tslint:disable-line */
      matches.push(match[index]);
    }
    try {
      for await (const m of matches) {
        const array: string[] = m.split(":");
        const [action, value] = array;
        await this.guild.commands.actions[action](message, value);
      }

      return str.replace(regex, "".trim());
    } catch (error) {
      return message.send(
        `There was an error while executing this command. ${error.message}`
      );
    }
  }
}

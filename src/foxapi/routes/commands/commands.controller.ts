import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  UseGuards
} from "@nestjs/common";
import { Collection } from "discord.js";
import { Command, FoxClient } from "../../../util";
import { FoxService } from "../../app.service";
import { Client } from "../../decorators/client.decorator";
import { CommandOptions } from "../../dtos/tglcommand.dto";
import { AuthGuard } from "../../guards/auth.guard";
const excludedCommands: string[] = [
  "eval",
  "exec",
  "addperm",
  "addpatreon",
  "rmpatreon",
  "restart",
  "reload",
  "addmoney",
  "removemoney"
];

@Controller()
export class CommandsController {
  public constructor(@Inject("FoxService") private readonly fox: FoxService) {}
  @Get()
  public async getAll(@Client() client: FoxClient): Promise<any> {
    const help: Object = {};
    client.commands
      .filter(c => excludedCommands.indexOf(c.name) < 0)
      .forEach((cmd: Command) => {
        const cat: string = cmd.category;
        cmd.executor = undefined;
        if (!help.hasOwnProperty(cat)) {
          help[cat] = [];
        }
        help[cat].push(cmd);
      });

    return help;
  }

  @Get("/:pkg")
  @UseGuards(AuthGuard)
  public async getPackages(
    @Client() client: FoxClient,
    @Param("pkg") pkg: string,
    @Query("guild") guild: string
  ): Promise<Collection<string, Command>> {
    const settings: any = await this.fox.evalContext("GET_SETTINGS", client, {
      guild
    });
    let commands: Collection<string, Command> = client.commands.filter(
      cmd => cmd.category === pkg.capitalize()
    );
    commands = commands.filter(c => excludedCommands.indexOf(c.name) < 0);
    commands.forEach(command => {
      command.enabled =
        (settings.disabledCommands ? settings.disabledCommands : []).indexOf(
          command.name
        ) > -1
          ? false
          : true;
    });

    return commands;
  }

  @Patch("/:guild")
  @UseGuards(AuthGuard)
  public async toggleCommand(
    @Client() client: FoxClient,
    @Body() options: CommandOptions,
    @Param("guild") guild: string
  ): Promise<string[]> {
    let array: any = await this.fox.evalContext("GET_SETTINGS", client, {
      guild
    });
    array = array.disabledCommands;
    const { bool, command }: CommandOptions = options;
    bool ? array.splice(array.indexOf(command), 1) : array.push(command);
    const commands: string[] = await this.fox.evalContext(
      "TOGGLE_SETTING_ARRAY",
      client,
      { guild, key: "disabledCommands", value: array }
    );

    return commands;
  }
}

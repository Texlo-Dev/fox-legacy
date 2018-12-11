import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { CustomCommands, FoxClient } from "../../../../util";
import { FoxService } from "../../../app.service";
import { Client } from "../../../decorators/client.decorator";
import { CCommandOptions } from "../../../dtos/ccommand.dto";
import { AuthGuard } from "../../../guards/auth.guard";

@Controller("customcommands")
@UseGuards(AuthGuard)
export class CCController {
  public constructor(@Inject("FoxService") public readonly fox: FoxService) {}

  @Post()
  public async createCommand(
    @Body(new ValidationPipe({ transform: true })) options: CCommandOptions,
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<CustomCommands> {
    const cmds: CustomCommands = await this.fox.evalContext(
      "ADD_COMMAND",
      client,
      { guild, ...options }
    );

    return cmds;
  }
  @Get()
  public async getCommands(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<CustomCommands> {
    const cmds: CustomCommands = await this.fox.evalContext(
      "GET_COMMANDS",
      client,
      { guild }
    );

    return cmds;
  }

  @Delete("/:command")
  public async removeCommand(
    @Client() client: FoxClient,
    @Param() { guild, command }: { command: string; guild: string }
  ): Promise<CustomCommands> {
    const cmds: CustomCommands = await this.fox.evalContext(
      "DELETE_COMMAND",
      client,
      { guild, command }
    );

    return cmds;
  }
}

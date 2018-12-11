import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { FoxClient } from "../../../../util";
import GuildConfig from "../../../../util/core/guildConfig";
import { FoxService } from "../../../app.service";
import { Client } from "../../../decorators/client.decorator";
import { BasePatchOptions } from "../../../dtos/basepatch.dto";
import { AuthGuard } from "../../../guards/auth.guard";

@Controller("config")
@UseGuards(AuthGuard)
export class ConfigController {
  public constructor(@Inject("FoxService") public readonly fox: FoxService) {}
  @Get()
  public async getConfig(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<GuildConfig> {
    const settings: GuildConfig = await this.fox.evalContext(
      "GET_SETTINGS",
      client,
      {
        guild
      }
    );

    return settings;
  }

  @Patch()
  public async setConfig(
    @Client() client: FoxClient,
    @Param("guild") guild: string,
    @Body(new ValidationPipe({ transform: true }))
    { key, value, bool }: BasePatchOptions
  ): Promise<GuildConfig> {
    const settings: GuildConfig = await this.fox.evalContext(
      "TOGGLE_SETTING",
      client,
      {
        guild,
        key,
        value,
        bool
      }
    );

    return settings;
  }
}

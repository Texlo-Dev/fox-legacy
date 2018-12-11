import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  ValidationPipe
} from "@nestjs/common";
import { FoxClient, Leveling } from "../../../../util";
import { FoxService } from "../../../app.service";
import { Client } from "../../../decorators/client.decorator";
import { BasePatchOptions } from "../../../dtos/basepatch.dto";

@Controller("leveling")
export class LevelingController {
  public constructor(@Inject("FoxService") private readonly fox: FoxService) {}
  @Get()
  public async getLeveling(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<Leveling> {
    const arr: Leveling = await this.fox.evalContext("GET_LEVELING", client, {
      guild
    });

    return arr;
  }

  @Patch()
  public async setLeveling(
    @Client() client: FoxClient,
    @Body(new ValidationPipe({ transform: true }))
    { key, value, bool }: BasePatchOptions,
    @Param("guild") guild: string
  ): Promise<any> {
    return this.fox.evalContext("PATCH_LEVELING", client, {
      guild,
      key,
      value,
      bool
    });
  }
}

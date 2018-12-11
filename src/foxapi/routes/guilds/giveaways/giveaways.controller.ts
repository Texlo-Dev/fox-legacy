import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { FoxClient, GiveawayStore } from "../../../../util";
import { FoxService } from "../../../app.service";
import { Client } from "../../../decorators/client.decorator";
import { GiveawayOptions } from "../../../dtos/giveaway.dto";
import { AuthGuard } from "../../../guards/auth.guard";

@Controller("giveaways")
@UseGuards(AuthGuard)
export class GiveawaysController {
  public constructor(@Inject("FoxService") public readonly fox: FoxService) {}

  @Post()
  public async createGiveaway(
    @Client() client: FoxClient,
    @Param() guild: string,
    @Body(new ValidationPipe({ transform: true })) options: GiveawayOptions
  ): Promise<GiveawayStore> {
    const gw: GiveawayStore = await this.fox.evalContext(
      "ADD_GIVEAWAY",
      client,
      { guild, ...options }
    );

    return gw;
  }
  @Get()
  public async getGiveaways(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<GiveawayStore> {
    const gw: GiveawayStore = await this.fox.evalContext(
      "GET_GIVEAWAYS",
      client,
      { guild }
    );

    return gw;
  }
}

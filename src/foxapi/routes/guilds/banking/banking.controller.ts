import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { Banking, FoxClient } from "../../../../util";
import { FoxService } from "../../../app.service";
import { Client } from "../../../decorators/client.decorator";
import { BasePatchOptions } from "../../../dtos/basepatch.dto";
import { TestDTO } from "../../../dtos/test.dto";
import { AuthGuard } from "../../../guards/auth.guard";

@Controller("banking")
@UseGuards(AuthGuard)
export class BankingController {
  public constructor(@Inject("FoxService") public readonly fox: FoxService) {}
  @Get()
  public async getAll(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<Banking> {
    const arr: Banking = await this.fox.evalContext("GET_BANKING", client, {
      guild
    });

    return arr;
  }

  @Patch()
  public async saveBanking(
    @Client() client: FoxClient,
    @Param("guild") guild: string,
    @Body(new ValidationPipe({ transform: true }))
    { key, value, bool }: BasePatchOptions
  ): Promise<Banking> {
    const arr: Banking = await this.fox.evalContext("PATCH_BANKING", client, {
      guild,
      key,
      value,
      bool
    });

    return arr;
  }

  @Post("/test")
  public testing(@Body(new ValidationPipe()) test: TestDTO): string {
    return test.string;
  }
}

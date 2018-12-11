import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  ValidationPipe
} from "@nestjs/common";
import { FoxClient } from "../../../../util";
import { FoxService } from "../../../app.service";
import { Client } from "../../../decorators/client.decorator";
import { PackageOptions } from "../../../dtos/package.dto";

@Controller("packages")
export class PackagesController {
  public constructor(@Inject("FoxService") private readonly fox: FoxService) {}
  @Get()
  public async getPackages(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<any> {
    return this.fox.evalContext("GET_PACKAGES", client, { guild });
  }

  @Patch()
  public async togglePackage(
    @Client() client: FoxClient,
    @Param("guild") guild: string,
    @Body(new ValidationPipe({ transform: true })) options: PackageOptions
  ): Promise<any> {
    return this.fox.evalContext("TOGGLE_PACKAGE", client, {
      guild,
      ...options
    });
  }
}

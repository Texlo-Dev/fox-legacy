import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { Auth, FoxClient, FoxPermission } from "../../util";
import { FoxService } from "../app.service";
import { Client } from "../decorators/client.decorator";
import { PermOptions } from "../dtos/permission.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller()
export class PermissionsController {
  public constructor(@Inject("FoxService") private readonly fox: FoxService) {}

  @Patch("/:guild")
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard)
  public async createPerm(
    @Client() client: FoxClient,
    @Body() options: PermOptions,
    @Param("guild") guild: string
  ): Promise<any> {
    const { perm, status, target }: PermOptions = options;

    return this.fox.evalContext("ADD_PERMISSION", client, {
      guild,
      perm,
      status,
      target
    });
  }

  @Get()
  public async findAll(@Client() client: FoxClient): Promise<{}> {
    const obj: object = {};
    for await (const perm of client.permissions.values()) {
      const cat: string = perm.category;
      if (!obj.hasOwnProperty(cat)) {
        obj[cat] = [];
      }
      obj[cat].push(perm);
    }

    return obj;
  }

  @Get("/:guild")
  @UseGuards(AuthGuard)
  public async getPerms(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<FoxPermission[]> {
    const perms: FoxPermission[] = await this.fox.evalContext(
      "GET_PERMISSIONS",
      client,
      { guild }
    );

    return perms;
  }

  @Delete("/:guild/:target")
  @UseGuards(AuthGuard)
  public async removePerm(
    @Client() client: FoxClient,
    @Param() params: any
  ): Promise<object> {
    const { guild, target } = params;

    return this.fox.evalContext("DELETE_PERMISSION", client, {
      guild,
      target
    });
  }
}

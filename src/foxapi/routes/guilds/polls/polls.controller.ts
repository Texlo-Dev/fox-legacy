import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  ValidationPipe,
  Delete
} from "@nestjs/common";
import { FoxClient } from "../../../../util";
import { FoxService } from "../../../app.service";
import { Client } from "../../../decorators/client.decorator";
import { PollOptions } from "../../../dtos/newpoll.dto";

@Controller("polls")
export class PollsController {
  public constructor(@Inject("FoxService") private readonly fox: FoxService) {}

  @Post()
  public async createPoll(
    @Client() client: FoxClient,
    @Body(new ValidationPipe({ transform: true })) options: PollOptions,
    @Param("guild") guild: string
  ): Promise<any> {
    return this.fox.evalContext("ADD_POLL", client, { guild, ...options });
  }

  @Patch("/:name")
  public async editPoll(
    @Client() client: FoxClient,
    @Param() { name, guild }: { guild: string; name: string },
    @Body("action") action: string
  ): Promise<any> {
    return this.fox.evalContext("PATCH_POLL", client, { guild, name, action });
  }
  @Get()
  public async getPolls(
    @Client() client: FoxClient,
    @Param("guild") guild: string
  ): Promise<any> {
    return this.fox.evalContext("GET_POLLS", client, { guild });
  }

  @Delete("/:name")
  public async removePoll(
      @Client() client: FoxClient,
      @Param() { name, guild }: { guild: string; name: string },
  ): Promise<any> {
      return this.fox.evalContext("DELETE_POLL", client, { guild });
  }
}

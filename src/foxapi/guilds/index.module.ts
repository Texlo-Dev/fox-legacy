import { Module } from "@nestjs/common";
import { GuildIndexController } from "./index.controller";
@Module({
  controllers: [GuildIndexController]
})
export class GuildIndexModule {}

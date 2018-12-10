import { Module } from "@nestjs/common";
import { LevelingController } from "./leveling.controller";
@Module({
  controllers: [LevelingController]
})
export class LevelingModule {}

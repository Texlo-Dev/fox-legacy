import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { LevelingController } from "./leveling.controller";
@Module({
  controllers: [LevelingController],
  providers: [FoxService]
})
export class LevelingModule {}

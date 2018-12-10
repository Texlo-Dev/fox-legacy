import { Module } from "@nestjs/common";
import { CCController } from "./ccommands.controller";
@Module({
  controllers: [CCController]
})
export class CCModule {}

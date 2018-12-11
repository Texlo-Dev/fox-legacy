import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { CCController } from "./ccommands.controller";
@Module({
  controllers: [CCController],
  providers: [FoxService]
})
export class CCModule {}

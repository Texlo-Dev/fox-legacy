import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { GiveawaysController } from "./giveaways.controller";
@Module({
  controllers: [GiveawaysController],
  providers: [FoxService]
})
export class GiveawaysModule {}

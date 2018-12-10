import { Module } from "@nestjs/common";
import { GiveawaysController } from "./giveaways.controller";
@Module({
  controllers: [GiveawaysController]
})
export class GiveawaysModule {}

import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { PollsController } from "./polls.controller";
@Module({
  controllers: [PollsController],
  providers: [FoxService]
})
export class PollsModule {}

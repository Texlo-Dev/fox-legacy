import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { TicketsController } from "./tickets.controller";
@Module({
  controllers: [TicketsController],
  providers: [FoxService]
})
export class TicketsModule {}

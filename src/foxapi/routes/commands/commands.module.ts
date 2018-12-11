import { Module } from "@nestjs/common";
import { FoxService } from "../../app.service";
import { CommandsController } from "./commands.controller";

@Module({
  controllers: [CommandsController],
  providers: [FoxService]
})
export class CommandsModule {}

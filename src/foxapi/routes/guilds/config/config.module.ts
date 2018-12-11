import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { ConfigController } from "./config.controller";
@Module({
  controllers: [ConfigController],
  providers: [FoxService]
})
export class ConfigModule {}

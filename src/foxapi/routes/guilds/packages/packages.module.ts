import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { PackagesController } from "./packages.controller";
@Module({
  controllers: [PackagesController],
  providers: [FoxService]
})
export class PackagesModule {}

import { Module } from "@nestjs/common";
import { PackagesController } from "./packages.controller";
@Module({
  controllers: [PackagesController]
})
export class PackagesModule {}

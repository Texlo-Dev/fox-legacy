import { Module } from "@nestjs/common";
import { FoxService } from "../../app.service";
import { PermissionsController } from "./permissions.controller";

@Module({
  controllers: [PermissionsController],
  providers: [FoxService]
})
export class PermissionsModule {}

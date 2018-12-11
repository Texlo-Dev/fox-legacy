import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { TagsController } from "./tags.controller";
@Module({
  controllers: [TagsController],
  providers: [FoxService]
})
export class TagsModule {}

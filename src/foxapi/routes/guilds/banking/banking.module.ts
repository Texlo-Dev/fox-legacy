import { Module } from "@nestjs/common";
import { FoxService } from "../../../app.service";
import { BankingController } from "./banking.controller";
@Module({
  controllers: [BankingController],
  providers: [FoxService]
})
export class BankingModule {}

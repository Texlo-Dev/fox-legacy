import { Module } from "@nestjs/common";
import { BankingController } from "./banking.controller";
@Module({
  controllers: [BankingController]
})
export class BankingModule {}

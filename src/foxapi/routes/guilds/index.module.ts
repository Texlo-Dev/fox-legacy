import { Module } from "@nestjs/common";
import { BankingModule } from "./banking/banking.module";
import { ConfigModule } from "./config/config.module";
import { CCModule } from "./customcommands/ccommands.module";
import { GiveawaysModule } from "./giveaways/giveaways.module";
import { GuildController } from "./index.controller";
import { LevelingModule } from "./leveling/leveling.module";
import { PollsModule } from "./polls/polls.module";
import { TagsModule } from "./tags/tags.module";
import { TicketsModule } from "./tickets/tickets.module";
@Module({
  imports: [
    BankingModule,
    TagsModule,
    CCModule,
    LevelingModule,
    ConfigModule,
    GiveawaysModule,
    PollsModule,
    TagsModule,
    TicketsModule
  ],
  controllers: [GuildController]
})
export class GuildModule {}

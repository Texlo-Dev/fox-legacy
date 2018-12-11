import { Routes } from "nest-router";
import { CommandsModule } from "./commands/commands.module";
import { BankingModule } from "./guilds/banking/banking.module";
import { ConfigModule } from "./guilds/config/config.module";
import { CCModule } from "./guilds/customcommands/ccommands.module";
import { GiveawaysModule } from "./guilds/giveaways/giveaways.module";
import { GuildModule } from "./guilds/index.module";
import { LevelingModule } from "./guilds/leveling/leveling.module";
import { MusicModule } from "./guilds/music/music.module";
import { PackagesModule } from "./guilds/packages/packages.module";
import { PollsModule } from "./guilds/polls/polls.module";
import { TagsModule } from "./guilds/tags/tags.module";
import { TicketsModule } from "./guilds/tickets/tickets.module";
import { IndexModule } from "./index.module";
import { PermissionsModule } from "./permissions/permissions.module";

export const routes: Routes = [
  {
    path: "/api",
    module: IndexModule,
    children: [
      {
        path: "/permissions",
        module: PermissionsModule
      },
      {
        path: "/commands",
        module: CommandsModule
      },
      {
        path: "/guilds/:guild",
        module: GuildModule,
        children: [
          BankingModule,
          TagsModule,
          CCModule,
          LevelingModule,
          MusicModule,
          ConfigModule,
          GiveawaysModule,
          PollsModule,
          PackagesModule,
          TicketsModule
        ]
      }
    ]
  }
];

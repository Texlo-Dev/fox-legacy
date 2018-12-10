import { Routes } from "nest-router";
import { CommandsModule } from "./commands/commands.module";
import { BankingModule } from "./guilds/banking/banking.module";
import { ConfigModule } from "./guilds/config/config.module";
import { CCModule } from "./guilds/customcommands/ccommands.module";
import { GiveawaysModule } from "./guilds/giveaways/giveaways.module";
import { GuildIndexModule } from "./guilds/index.module";
import { LevelingModule } from "./guilds/leveling/leveling.module";
import { PackagesModule } from "./guilds/packages/packages.module";
import { PollsModule } from "./guilds/polls/polls.module";
import { TagsModule } from "./guilds/tags/tags.module";
import { Index } from "./index.module";
import { PermissionsModule } from "./permissions/permissions.module";

export const routes: Routes = [
  {
    path: "/api",
    module: Index,
    children: [
      {
        path: "/guilds/:guild",
        module: GuildIndexModule,
        children: [
          {
            path: "/banking",
            module: BankingModule
          },
          {
            path: "/config",
            module: ConfigModule
          },
          {
            path: "/customcommands",
            module: CCModule
          },
          {
            path: "/giveaways",
            module: GiveawaysModule
          },
          {
            path: "/leveling",
            module: LevelingModule
          },
          {
            path: "/packages",
            module: PackagesModule
          },
          {
            path: "/polls",
            module: PollsModule
          },
          {
            path: "/tags",
            module: TagsModule
          }
        ]
      },
      {
        path: "/permissions",
        module: PermissionsModule
      },
      {
        path: "/commands",
        module: CommandsModule
      }
    ]
  }
];

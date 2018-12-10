import { HttpModule, Module } from "@nestjs/common";
import { RouterModule } from "nest-router";
import { AppController } from "./app.controller";
import { CommandsModule } from "./commands/commands.module";
import { GuildIndexModule } from "./guilds/index.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { routes } from "./routes";

@Module({
  imports: [
    RouterModule.forRoutes(routes),
    GuildIndexModule,
    CommandsModule,
    PermissionsModule,
    HttpModule
  ],
  controllers: [AppController]
})
export class AppModule {}

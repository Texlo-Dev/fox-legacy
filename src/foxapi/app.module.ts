import { HttpModule, Module } from "@nestjs/common";
import { RouterModule } from "nest-router";
import { FoxService } from "./app.service";
import { CommandsModule } from "./routes/commands/commands.module";
import { GuildModule } from "./routes/guilds/index.module";
import { IndexModule } from "./routes/index.module";
import { PermissionsModule } from "./routes/permissions/permissions.module";
import { routes } from "./routes/routes";

@Module({
  imports: [
    RouterModule.forRoutes(routes),
    IndexModule,
    GuildModule,
    CommandsModule,
    PermissionsModule,
    HttpModule
  ],
  providers: [FoxService]
})
export class AppModule {}

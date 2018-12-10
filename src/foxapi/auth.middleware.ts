import { Injectable, MiddlewareFunction, NestMiddleware } from "@nestjs/common";
import { clientSecret } from "../config.json";
import { FoxGuild } from "../util/extensions/index.js";
import { FoxClient } from "../util/index.js";
import { decrypt } from "../util/Utils";
import { FoxService } from "./app.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  public constructor(private readonly fox: FoxService) {}

  public resolve(...args: any[]): MiddlewareFunction {
    return async (req, res, next) => {
      const token: string = req.headers.authorization;
      const client: FoxClient = req.client;
      if (!token) {
        res.statusCode = 400;
        res.writeHead(res.statusCode, {
          "Content-Type": "application/json"
        });
        res.end(
          JSON.stringify({ status: res.statusCode, error: "Bad Request" })
        );
        next();
      }
      req.user = decrypt(token, clientSecret);
      if (!req.user) {
        res.statusCode = 401;
        res.writeHead(res.statusCode, {
          "Content-Type": "application/json"
        });
        res.end(
          JSON.stringify({ status: res.statusCode, error: "Unauthorized" })
        );
        next();
      }
      if (req.originalUrl) {
        return next();
      }
      const guildID: string = req.originalUrl.slice(1).split("/")[0];
      console.log(guildID);
      const result: any = await this.fox.botEval(client, guildID, () => {
        const guild: FoxGuild = client.guilds.get(guildID);
        if (!guild) return false;

        return (
          guild.ownerID === req.user ||
          guild.member(req.user).hasPermission("MANAGE_GUILD")
        );
      });
      console.log(result);
      if (!result) {
        res.statusCode = 401;
        res.writeHead(res.statusCode, {
          "Content-Type": "application/json"
        });
        res.end(
          JSON.stringify({ status: res.statusCode, error: "Unauthorized" })
        );
      }
      next();
    };
  }
}

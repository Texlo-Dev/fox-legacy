import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable
} from "@nestjs/common";
import { clientSecret } from "../../config.json";
import { decrypt } from "../../util/Utils";
import { FoxService } from "../app.service";

@Injectable()
export class AuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const fox: FoxService = new FoxService();
    const { client, originalUrl } = req.raw;
    const token: string = req.headers.authorization;
    if (!token)
      throw new HttpException(
        "Missing Authentication",
        HttpStatus.UNAUTHORIZED
      );

    req.user = decrypt(token, clientSecret);
    if (!req.user)
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    const guild: string = req.params.guild || req.query.guild;
    const result: any = await fox.botEval(
      client,
      guild,
      `if (guild) {
        guild.ownerID === '${req.user}' || guild.member('${
        req.user
      }').hasPermission("MANAGE_GUILD")
      }`
    );

    if (!result && !(originalUrl === "/api/embed")) return false;
    else return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FoxUser } from "../../util/extensions/";
import { FoxService } from "../app.service";

@Injectable()
export class PatreonGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const reqtier: number = this.reflector.get(
      "tier",
      context.getHandler()
    ) as number;
    const req: any = context.switchToHttp().getRequest();
    const { client } = req.raw;
    const user: FoxUser = await client.users.fetch(req.user);
    const tier: number = await user._setTier();
    if (tier >= reqtier) return true;
    else
      throw new HttpException(
        "Forbidden: Your Patreon tier is not high enough.",
        HttpStatus.FORBIDDEN
      );
  }
}

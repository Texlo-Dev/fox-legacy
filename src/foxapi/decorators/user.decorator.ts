// tslint:disable
import { createParamDecorator } from "@nestjs/common";
export const User = createParamDecorator((data, req) => req.raw.user);

// tslint:disable
import { createParamDecorator } from "@nestjs/common";
export const Client = createParamDecorator((data, req) => req.raw.client);

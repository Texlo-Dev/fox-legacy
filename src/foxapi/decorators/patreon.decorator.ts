import { ReflectMetadata } from "@nestjs/common";
export const Tier = (tier: number) => ReflectMetadata("tier", tier);

import { IsBoolean, IsString } from "class-validator";

export class BasePatchOptions {
  @IsBoolean() public readonly bool: boolean;
  @IsString() public readonly key: string;
  public readonly value: any;
}

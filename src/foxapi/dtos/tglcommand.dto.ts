import { IsBoolean, IsString } from "class-validator";

export class CommandOptions {
  @IsBoolean() public readonly bool: boolean;
  @IsString() public readonly command: string;
  @IsString() public readonly guild: string;
}

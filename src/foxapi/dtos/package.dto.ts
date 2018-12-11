import { IsBoolean, IsString } from "class-validator";
export class PackageOptions {
  @IsBoolean() public readonly enabled: boolean;
  @IsString() public readonly guild: string;
  @IsString() public readonly pkg: string;
}

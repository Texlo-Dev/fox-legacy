import { IsString } from "class-validator";

export class PermOptions {
  @IsString() public readonly perm: string;
  @IsString() public readonly status: string;
  @IsString() public readonly target: string;
}

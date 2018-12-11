import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";
export class CCommandOptions {
  public readonly aliases: string[];
  @IsString() public readonly category: string;
  @IsNumber() public readonly cooldown: number;
  @IsBoolean() public readonly deleteCommand: boolean;
  @IsString() public readonly description: string;
  @IsBoolean() public readonly dmCommand: boolean;
  @IsBoolean() public readonly enabled: boolean;
  @IsString() public readonly guild: string;
  @IsString() public readonly name: string;
  @IsArray() public readonly requiredPerms: string[];
  @IsString() public readonly template: string;
  @IsString() public readonly usage: string;
}

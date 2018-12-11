import { IsArray, IsBoolean, IsString } from "class-validator";

export class PollOptions {
  public readonly channel: any;
  @IsString() public readonly name: string;
  @IsBoolean() public readonly open: boolean;
  @IsArray() public readonly possibleAnswers: string[];
  @IsString() public readonly question: string;
  @IsString() public readonly type: string;
}

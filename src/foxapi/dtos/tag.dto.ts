import { IsString, MaxLength } from "class-validator";

export class TagOptions {
  @IsString() @MaxLength(2000) public readonly content: string;
  @IsString() @MaxLength(20) public readonly name: string;
}

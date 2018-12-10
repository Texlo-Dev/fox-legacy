import { IsString } from "class-validator";
export class TestDTO {
  @IsString() public readonly string: string;
}

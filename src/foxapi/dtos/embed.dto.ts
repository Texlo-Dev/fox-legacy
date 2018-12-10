import { IsString } from "class-validator";

export class CreateEmbed {
  public readonly author: object;
  @IsString() public readonly channel?: string;
  @IsString() public readonly color: string;
  @IsString() public readonly description: string;
  public readonly fields: object[];
  public readonly footer: object;
  @IsString() public readonly id: string;
  @IsString() public readonly image: string;
  @IsString() public readonly thumbnail: string;
  @IsString() public readonly title: string;
  @IsString() public readonly url: string;
  @IsString() public readonly whurl?: string;
}

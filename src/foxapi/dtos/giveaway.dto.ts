import { IsNumber, IsString } from "class-validator";
export class GiveawayOptions {
  public channel: any;
  @IsNumber() public endDate: number;
  public guild: string;
  @IsNumber() public maxWinners: number;
  public reactionEmote: any;
  @IsNumber() public timeeRemaining: number;
}

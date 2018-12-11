import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { Tags } from "../../../../util/Mongo";
import { User } from "../../../decorators/user.decorator";
import { TagOptions } from "../../../dtos/tag.dto";
import { AuthGuard } from "../../../guards/auth.guard";

@Controller("tags")
@UseGuards(AuthGuard)
export class TagsController {
  @Post()
  public async createTag(
    @Body(new ValidationPipe({ transform: true }))
    { name, content }: TagOptions,
    @Param("guild") guild: string,
    @User() user: string
  ): Promise<Tags[]> {
    const entry: Tags = new Tags({
      guildID: guild,
      tagName: name,
      tagContent: content,
      author: user,
      createdAt: new Date(),
      usage_count: 0
    });
    await entry.save();
    const tags: Tags[] = await Tags.find({ guildID: guild });

    return tags.map(t => t.get());
  }
  @Get()
  public async findAll(@Param("guild") guild: string): Promise<Tags[]> {
    const tags: Tags[] = await Tags.find({ guildID: guild });

    return tags.map(t => t.get());
  }

  @Get("/:tag")
  public async findOne(@Param()
  {
    guild,
    tag
  }: {
    guild: string;
    tag: string;
  }): Promise<Tags> {
    const tg: Tags = await Tags.findOne({ guildID: guild, tagName: tag });

    return tg.get();
  }
  @Delete("/:tag")
  public async removeTag(@Param()
  {
    guild,
    tag
  }: {
    guild: string;
    tag: string;
  }): Promise<Tags[]> {
    const tg: Tags = await Tags.findOne({ guildID: guild, tagName: tag });
    if (!tg)
      throw new HttpException("Tag does not exist.", HttpStatus.NOT_FOUND);
    await tg.remove();
    const tags: Tags[] = await Tags.find({ guildID: guild });

    return tags.map(t => t.get());
  }
}

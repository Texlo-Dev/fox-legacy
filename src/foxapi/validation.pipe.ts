import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform
} from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  public async transform(
    value: any,
    { metatype }: ArgumentMetadata
  ): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object: any[] = plainToClass(metatype, value);
    const errors: any = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];

    return !types.find(type => metatype === type);
  }
}

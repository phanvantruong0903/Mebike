import {
  IsString,
  IsNotEmpty,
  MinLength,
  Min,
  Max,
  IsPhoneNumber,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Name must be at least 3 characters' })
  name!: string;

  @IsNotEmpty()
  @IsPhoneNumber('VN', { message: 'Invalid Vietnam phone number' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  address!: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Contact fee must be at least 0' })
  @Max(1, { message: 'Contact fee must be at most 1' })
  contactFee!: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Min, Max } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'skindora@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'skindora' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '123456789' })
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 1990 })
  @IsNotEmpty()
  @Min(1900, { message: 'YOB must be greater than 1900' })
  @Max(new Date().getFullYear(), { message: 'YOB must be less than now' })
  YOB!: number;
}

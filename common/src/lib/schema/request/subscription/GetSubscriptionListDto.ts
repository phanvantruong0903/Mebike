import { Min, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSubscriptionListDto {
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page!: number;

  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit!: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

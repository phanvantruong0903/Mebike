import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetBikeDetailDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GetUserDetailDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}

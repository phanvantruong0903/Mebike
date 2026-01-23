import { IsString, IsNotEmpty } from 'class-validator';

export class PackageDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

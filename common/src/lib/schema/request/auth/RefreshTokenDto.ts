import { IsNotEmpty, IsString, IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @IsJWT()
  refreshToken!: string;

  @IsString()
  @IsNotEmpty()
  @IsJWT()
  accessToken!: string;
}

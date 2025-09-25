import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/lib/interfaces/token-payload';

@Injectable()
export class JwtServiceCustom {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(payload: TokenPayload, options?: any) {
    return this.jwtService.sign(payload, options);
  }

  async decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  async verifyToken(token: string, options?: any) {
    return this.jwtService.verify(token, options);
  }
}

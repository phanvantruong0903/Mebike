import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateUserDto } from './dto/CreateUserDto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginUserDto })
  async login(@Body() body: LoginUserDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }
}

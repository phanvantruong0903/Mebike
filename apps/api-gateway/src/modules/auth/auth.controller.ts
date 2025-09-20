import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/LoginUserDto';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
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

  @Get(':id')
  async detailUser(@Param('id') id: string) {
    return this.authService.userDetail(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    console.log(body);
    return this.authService.updateUser(id, body);
  }

  @Get()
  async getAllUser() {
    return this.authService.getAllUser();
  }
}

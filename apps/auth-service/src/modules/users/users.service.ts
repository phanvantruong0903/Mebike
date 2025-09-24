import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { BaseService } from '@Mebike/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { prisma } from '@Mebike/common';
import { LoginUserDto } from './dto/LoginUserDto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { USER_MESSAGES } from '@Mebike/common';
import { throwGrpcError } from '@Mebike/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends BaseService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor() {
    super(prisma.user);
  }

  async validateUser(data: LoginUserDto) {
    if (data) {
      const dtoInstance = plainToInstance(LoginUserDto, data);
      try {
        await validateOrReject(dtoInstance);
        const findUser = await prisma.user.findUnique({
          where: { email: dtoInstance.email },
        });

        if (!findUser) {
          throwGrpcError('Not Found', [USER_MESSAGES.NOT_FOUND]);
        }

        const isMatch = await bcrypt.compare(
          dtoInstance.password,
          findUser?.password
        );

        if (!isMatch) {
          throwGrpcError('Not Found', [USER_MESSAGES.VALIDATION_FAILED]);
        }
      } catch (error: unknown) {
        const err = error as Error;
        throwGrpcError('Internal Server Error', [err?.message]);
      }
    }
  }
}

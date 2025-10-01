import { Injectable } from '@nestjs/common';
import { BaseService, prisma } from '@mebike/common';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { User } from '@prisma/client';

@Injectable()
export class UserService extends BaseService<User, never, UpdateUserDto> {
  constructor() {
    super(prisma.user);
  }

  async updatePassword(id: string, password: string) {
    return this.model.update({
      where: { id },
      data: { password },
    });
  }
}

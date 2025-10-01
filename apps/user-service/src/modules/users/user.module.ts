import { Module } from '@nestjs/common';
import { UserService } from './user.services';
import { UserController } from './user.controllers';

@Module({
  imports: [],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserService } from './user.services';
import { UserController } from './user.controllers';
import { ConsulModule } from '@mebike/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConsulModule, ConfigModule.forRoot({ isGlobal: true })],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

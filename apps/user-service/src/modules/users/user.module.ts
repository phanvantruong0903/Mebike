import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersGrpcController } from './users.grpc.controller';
import { UserConsulRegistrar } from '../../consul/consul.service';
import { ConsuleModule } from '@mebike/common';

@Module({
  imports: [ConsuleModule],
  controllers: [UsersGrpcController],
  providers: [UserService, UserConsulRegistrar],
})
export class UserModule {}

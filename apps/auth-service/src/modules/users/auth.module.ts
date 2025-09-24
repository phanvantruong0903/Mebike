import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth.grpc.controller';
import { AuthConsulRegistrar } from '../../consul/consul.service';
import { ConsuleModule } from '@mebike/common';
import { AuthService } from './auth.service';

@Module({
  imports: [ConsuleModule],
  controllers: [AuthGrpcController],
  providers: [AuthService, AuthConsulRegistrar],
})
export class AuthModule {}

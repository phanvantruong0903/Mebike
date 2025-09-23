import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthService } from './auth.service';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@mebike/common';
import { AuthResolver } from './auth.resolver';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConsuleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.USER,
        imports: [ConsuleModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const userService = await consulService.discoverService(
            CONSULT_SERVICE_ID.USER
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'user',
              protoPath: join(process.cwd(), 'common/src/lib/proto/user.proto'),
              url: `${userService.address}:${userService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}

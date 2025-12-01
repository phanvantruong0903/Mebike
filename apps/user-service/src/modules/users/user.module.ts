import { Module } from '@nestjs/common';
import { UserService } from './user.services';
import { UserController } from './user.controllers';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@loginex/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';

@Module({
  imports: [
    ConsuleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.AUTH,
        imports: [ConsuleModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const authService = await consulService.discoverService(
            CONSULT_SERVICE_ID.AUTH,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'auth',
              protoPath: join(process.cwd(), 'common/src/lib/proto/auth.proto'),
              url: `${authService.address}:${authService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

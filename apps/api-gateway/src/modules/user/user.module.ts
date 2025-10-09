import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthService } from '../auth/auth.service';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@mebike/common';
import { AuthResolver } from '../auth/auth.resolver';
import { ConfigModule } from '@nestjs/config';

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
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}

import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { AuthService } from './auth.service';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  RedisModule,
} from '@mebike/common';
import { AuthResolver } from './auth.resolver';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    WalletModule,
    ConsuleModule,
    RedisModule,
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
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

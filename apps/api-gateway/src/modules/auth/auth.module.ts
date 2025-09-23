import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthService } from './auth.service';
import { GRPC_PACKAGE } from '@mebike/common';
import { AuthResolver } from './auth.resolver';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.USER,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'user',
            protoPath: join(process.cwd(), 'common/src/lib/proto/user.proto'),
            url: configService.get<string>('USER_SERVICE_URL'),
          },
        }),
      },
    ]),
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}

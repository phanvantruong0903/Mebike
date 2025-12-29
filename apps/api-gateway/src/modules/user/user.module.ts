import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserAccountDataloader } from './user-account.dataloader';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConsulModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.USER,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const userService = await consulService.discoverService(
            CONSULT_SERVICE_ID.USER,
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
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, UserResolver, UserAccountDataloader],
  exports: [ClientsModule],
})
export class UserModule {}

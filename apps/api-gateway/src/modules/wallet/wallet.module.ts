import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@mebike/common';
import { join } from 'node:path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConsulModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.PAYMENT,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const service = await consulService.discoverService(
            CONSULT_SERVICE_ID.PAYMENT,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'wallet',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/wallet.proto',
              ),
              url: `${service.address}:${service.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [WalletService],
  controllers: [],
  exports: [WalletService],
})
export class WalletModule {}

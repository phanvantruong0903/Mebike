import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@mebike/common';
import { join } from 'node:path';
import { ConfigModule } from '@nestjs/config';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';

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
              package: 'transaction',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/transaction.proto',
              ),
              url: `${service.address}:${service.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [TransactionResolver, TransactionService],
})
export class TransactionModule {}

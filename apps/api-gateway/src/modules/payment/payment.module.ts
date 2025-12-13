import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@mebike/common';
import { join } from 'node:path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConsuleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.PAYMENT,
        imports: [ConsuleModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const service = await consulService.discoverService(
            CONSULT_SERVICE_ID.PAYMENT,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'payment',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/payment.proto',
              ),
              url: `${service.address}:${service.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [PaymentResolver, PaymentService],
})
export class PaymentModule {}

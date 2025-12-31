import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { PaymentController } from './payment.controller';
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
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}

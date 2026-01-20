import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { ConfigModule } from '@nestjs/config';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
} from '@mebike/common';
import { SubscriptionService } from './subscription.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConsulModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.PAYMENT,
        imports: [ConsulModule],
        useFactory: async (consulService: ConsulService) => {
          const paymentService = await consulService.discoverService(
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
              url: `${paymentService.address}:${paymentService.port}`,
              channelOptions: {
                'grpc.max_reconnect_backoff_ms': 5000,
                'grpc.initial_reconnect_backoff_ms': 1000,
              },
              maxRetryAttempts: 5,
              retryDelay: 3000,
            },
          };
        },
      },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}

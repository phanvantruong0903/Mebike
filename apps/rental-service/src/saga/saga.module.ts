import {
  GRPC_PACKAGE,
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  JwtSharedModule,
  RedisModule,
} from '@mebike/common';
import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { RentalActivities } from './activities';
import { TemporalService } from './temporal-service';
import { ConfigModule } from '@nestjs/config';
import { RentalModule } from '../modules/rental/rental.module';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    JwtSharedModule,
    forwardRef(() => RentalModule),
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.FLEET,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const fleetService = await consulService.discoverService(
            CONSULT_SERVICE_ID.FLEET,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'bike',
              protoPath: join(process.cwd(), 'common/src/lib/proto/bike.proto'),
              url: `${fleetService.address}:${fleetService.port}`,
              channelOptions: {
                'grpc.max_reconnect_backoff_ms': 5000,
                'grpc.initial_reconnect_backoff_ms': 1000,
              },
              maxRetryAttempts: 1,
            },
          };
        },
      },
      {
        name: GRPC_PACKAGE.PAYMENT,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const paymentService = await consulService.discoverService(
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
              url: `${paymentService.address}:${paymentService.port}`,
              channelOptions: {
                'grpc.max_reconnect_backoff_ms': 5000,
                'grpc.initial_reconnect_backoff_ms': 1000,
              },
              maxRetryAttempts: 1,
            },
          };
        },
      },
      // {
      //   name: GRPC_PACKAGE.PAYMENT,
      //   imports: [ConsulModule],
      //   inject: [ConsulService],
      //   useFactory: async (consulService: ConsulService) => {
      //     const paymentService = await consulService.discoverService(
      //       CONSULT_SERVICE_ID.PAYMENT,
      //     );
      //     return {
      //       transport: Transport.GRPC,
      //       options: {
      //         package: 'payment',
      //         protoPath: join(
      //           process.cwd(),
      //           'common/src/lib/proto/payment.proto',
      //         ),
      //         url: `${paymentService.address}:${paymentService.port}`,
      //         channelOptions: {
      //           'grpc.max_reconnect_backoff_ms': 5000,
      //           'grpc.initial_reconnect_backoff_ms': 1000,
      //         },
      //         maxRetryAttempts: 5,
      //         retryDelay: 3000,
      //       },
      //     };
      //   },
      // },
    ]),
  ],
  providers: [RentalActivities, TemporalService],
  exports: [TemporalService],
})
export class SagaModule {}

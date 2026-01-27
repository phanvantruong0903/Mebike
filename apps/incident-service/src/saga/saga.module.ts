import {
  GRPC_PACKAGE,
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
} from '@mebike/common';
import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { SosCreationActivity } from './activities';
import { TemporalService } from './temporal-service';
import { ConfigModule } from '@nestjs/config';
import { SosModule } from '../modules/sos/sos.module';

@Module({
  imports: [
    ConsulModule,
    forwardRef(() => SosModule),
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
              maxRetryAttempts: 5,
              retryDelay: 3000,
            },
          };
        },
      },
    ]),
  ],
  providers: [SosCreationActivity, TemporalService],
  exports: [TemporalService],
})
export class SagaModule {}

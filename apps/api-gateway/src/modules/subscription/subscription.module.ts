import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  RedisModule,
} from '@mebike/common';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { SubscriptionResolver } from './subscription.resolver';

@Module({
  imports: [
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.RENTAL,
        imports: [ConsulModule],
        inject: [ConsulService],
        useFactory: async (consulService: ConsulService) => {
          const subscriptionService = await consulService.discoverService(
            CONSULT_SERVICE_ID.RENTAL,
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'subscription',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/subscription.proto',
              ),
              url: `${subscriptionService.address}:${subscriptionService.port}`,
            },
          };
        },
      },
    ]),
  ],
  providers: [SubscriptionService, SubscriptionResolver],
})
export class SubscriptionModule {}

import {
  GRPC_PACKAGE,
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  KAFKA_SERVICE,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  JwtSharedModule,
  RedisModule,
} from '@mebike/common';
import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { UserCreationActivity } from './activities';
import { TemporalService } from './temporal-service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../modules/users/auth.module';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    JwtSharedModule,
    forwardRef(() => AuthModule),
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
              maxRetryAttempts: 5,
              retryDelay: 3000,
            },
          };
        },
      },
      {
        name: KAFKA_SERVICE.AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const brokers =
            configService.get<string>('KAFKA_BROKERS') || 'localhost:9092';
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: KAFKA_CLIENT_ID.AUTH_SERVICE,
                brokers: brokers.split(','),
              },
              consumer: {
                groupId: KAFKA_GROUP_ID.AUTH_SERVICE,
                allowAutoTopicCreation: true,
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [UserCreationActivity, TemporalService],
  exports: [TemporalService],
})
export class SagaModule {}

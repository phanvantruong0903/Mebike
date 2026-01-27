import { forwardRef, Module } from '@nestjs/common';
import { AuthGrpcController } from './auth.grpc.controller';
import {
  ConsulModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  JwtSharedModule,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  KAFKA_SERVICE,
  RedisModule,
} from '@mebike/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SagaModule } from '../../saga/saga.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

@Module({
  imports: [
    JwtSharedModule,
    RedisModule,
    ConsulModule,
    forwardRef(() => SagaModule),
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
              package: 'station',
              protoPath: join(
                process.cwd(),
                'common/src/lib/proto/station.proto',
              ),
              url: `${fleetService.address}:${fleetService.port}`,
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
                connectionTimeout: 10000,
                authenticationTimeout: 10000,
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
  controllers: [AuthGrpcController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

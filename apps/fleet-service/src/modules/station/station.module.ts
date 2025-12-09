import { Module } from '@nestjs/common';
import {
  ConsuleModule,
  ConsulService,
  CONSULT_SERVICE_ID,
  GRPC_PACKAGE,
  JwtSharedModule,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  KAFKA_SERVICE,
  RedisModule,
} from '@mebike/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { StationService } from './station.service';
import { StationController } from './station.controller';

@Module({
  imports: [
    ConsuleModule,
    RedisModule,
    JwtSharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: GRPC_PACKAGE.FLEET,
        imports: [ConsuleModule],
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
        name: KAFKA_SERVICE.FLEET_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const brokers =
            configService.get<string>('KAFKA_BROKERS') || 'localhost:9092';
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: KAFKA_CLIENT_ID.FLEET_SERVICE,
                brokers: brokers.split(','),
                retry: {
                  initialRetryTime: 300,
                  retries: 10,
                },
              },
              consumer: {
                groupId: KAFKA_GROUP_ID.FLEET_SERVICE,
              },
              producer: {
                allowAutoTopicCreation: true,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}

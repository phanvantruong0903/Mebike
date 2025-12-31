import { Module } from '@nestjs/common';
import {
  ConsulModule,
  JwtSharedModule,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  KAFKA_SERVICE,
  RedisModule,
} from '@mebike/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StationService } from './station.service';
import { StationController } from './station.controller';

@Module({
  imports: [
    ConsulModule,
    RedisModule,
    JwtSharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
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

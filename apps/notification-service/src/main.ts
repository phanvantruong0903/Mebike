import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  ConsulService,
  CONSULT_SERVICE_ID,
  KAFKA_GROUP_ID,
} from '@mebike/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

async function bootstrap() {
  dotenvConfig();

  const consulService = new ConsulService();
  const port = Number(process.env.NOTIFICATION_SERVICE_PORT) || 50053;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.NOTIFICATION,
    CONSULT_SERVICE_ID.NOTIFICATION,
    host,
    port,
  );

  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['grpc.health.v1'],
      protoPath: [join(process.cwd(), 'common/src/lib/proto/health.proto')],
      url: `0.0.0.0:${process.env.NOTIFICATION_SERVICE_PORT}`,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        connectionTimeout: 10000,
        authenticationTimeout: 10000,
      },
      consumer: {
        groupId: KAFKA_GROUP_ID.NOTIFICATION_SERVICE,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();

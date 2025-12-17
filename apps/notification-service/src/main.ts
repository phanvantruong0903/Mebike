import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  ConsulService,
  CONSULT_SERVICE_ID,
  KAFKA_GROUP_ID,
} from '@mebike/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config as dotenvConfig } from 'dotenv';

async function bootstrap() {
  dotenvConfig();
  console.log(
    'DEBUG: KAFKA_TOPIC keys:',
    Object.keys(require('@mebike/common').KAFKA_TOPIC),
  );

  const consulService = new ConsulService();
  const port = Number(process.env.NOTIFICATION_SERVICE_PORT) || 50053;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.NOTIFICATION,
    CONSULT_SERVICE_ID.NOTIFICATION,
    host,
    port,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        },
        consumer: {
          groupId: KAFKA_GROUP_ID.NOTIFICATION_SERVICE,
        },
        subscribe: {
          fromBeginning: true,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();

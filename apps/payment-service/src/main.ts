import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  ConsulService,
  CONSULT_SERVICE_ID,
  GrpcExceptionFilter,
  KAFKA_GROUP_ID,
} from '@mebike/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { config as dotenvConfig } from 'dotenv';
async function bootstrap() {
  dotenvConfig();

  const consulService = new ConsulService();
  const port = Number(process.env.PAYMENT_SERVICE_PORT) || 50056;
  const host = consulService.getLocalIp();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GrpcExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['payment', 'wallet', 'grpc.health.v1'],
      protoPath: [
        join(process.cwd(), 'common/src/lib/proto/payment.proto'),
        join(process.cwd(), 'common/src/lib/proto/wallet.proto'),
        join(process.cwd(), 'common/src/lib/proto/health.proto'),
      ],
      url: `0.0.0.0:${process.env.PAYMENT_SERVICE_PORT}`,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      },
      consumer: {
        groupId: KAFKA_GROUP_ID.PAYMENT_SERVICE,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });
  await app.startAllMicroservices();

  await consulService.registerService(
    CONSULT_SERVICE_ID.PAYMENT,
    CONSULT_SERVICE_ID.PAYMENT,
    host,
    port,
  );
}
bootstrap();

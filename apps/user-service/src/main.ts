import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  ConsulService,
  CONSULT_SERVICE_ID,
  GrpcExceptionFilter,
  KAFKA_GROUP_ID,
} from '@loginex/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { config as dotenvConfig } from 'dotenv';
async function bootstrap() {
  dotenvConfig();

  const app = await NestFactory.create(AppModule);

  const consulService = new ConsulService();
  const port = Number(process.env.USER_SERVICE_PORT) || 50052;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.USER,
    CONSULT_SERVICE_ID.USER,
    host,
    port,
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['user', 'grpc.health.v1'],
      protoPath: [
        join(process.cwd(), 'common/src/lib/proto/user.proto'),
        join(process.cwd(), 'common/src/lib/proto/health.proto'),
      ],
      url: `0.0.0.0:${process.env.USER_SERVICE_PORT}`,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      },
      consumer: {
        groupId: KAFKA_GROUP_ID.USER_SERVICE,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GrpcExceptionFilter());
  await app.startAllMicroservices();
}
bootstrap();

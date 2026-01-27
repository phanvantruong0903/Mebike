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
  const port = Number(process.env.FLEET_SERVICE_PORT) || 50054;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.FLEET,
    CONSULT_SERVICE_ID.FLEET,
    host,
    port,
  );

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GrpcExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: ['supplier', 'station', 'grpc.health.v1', 'bike'],
        protoPath: [
          join(process.cwd(), 'common/src/lib/proto/supplier.proto'),
          join(process.cwd(), 'common/src/lib/proto/station.proto'),
          join(process.cwd(), 'common/src/lib/proto/health.proto'),
          join(process.cwd(), 'common/src/lib/proto/bike.proto'),
        ],
        url: `0.0.0.0:${port}`,
      },
    },
    { inheritAppConfig: true },
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        connectionTimeout: 10000,
        authenticationTimeout: 10000,
      },
      consumer: {
        groupId: KAFKA_GROUP_ID.FLEET_SERVICE,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.init();
}
bootstrap();

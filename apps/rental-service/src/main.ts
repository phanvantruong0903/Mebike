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

  const app = await NestFactory.create(AppModule);

  const consulService = new ConsulService();
  const port = Number(process.env.RENTAL_SERVICE_PORT) || 50055;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.RENTAL,
    CONSULT_SERVICE_ID.RENTAL,
    host,
    port,
  );

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
        package: ['rental', 'reservation', 'grpc.health.v1'],
        protoPath: [
          join(process.cwd(), 'common/src/lib/proto/rental.proto'),
          join(process.cwd(), 'common/src/lib/proto/reservation.proto'),
          join(process.cwd(), 'common/src/lib/proto/health.proto'),
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
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      },
      consumer: {
        groupId: KAFKA_GROUP_ID.RENTAL_SERVICE,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();

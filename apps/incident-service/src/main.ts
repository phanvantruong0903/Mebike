import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  ConsulService,
  CONSULT_SERVICE_ID,
  GrpcExceptionFilter,
} from '@mebike/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { config as dotenvConfig } from 'dotenv';
async function bootstrap() {
  dotenvConfig();

  const consulService = new ConsulService();
  const port = Number(process.env.INCIDENT_SERVICE_PORT) || 50049;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.INCIDENT,
    CONSULT_SERVICE_ID.INCIDENT,
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
        package: ['grpc.health.v1', 'sos'],
        protoPath: [
          join(process.cwd(), 'common/src/lib/proto/health.proto'),
          join(process.cwd(), 'common/src/lib/proto/sos.proto'),
        ],
        url: `0.0.0.0:${port}`,
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
}
bootstrap();

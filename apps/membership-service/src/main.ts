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

/**
 * Bootstraps the Nest application: loads environment variables, registers the service with Consul, applies global validation and gRPC error filters, attaches the gRPC microservice, and starts all microservices.
 *
 * The service port is read from the `MEMBERSHIP_SERVICE_PORT` environment variable and defaults to `50059` if unset.
 */
async function bootstrap() {
  dotenvConfig();

  const app = await NestFactory.create(AppModule);

  const consulService = new ConsulService();
  const port = Number(process.env.MEMBERSHIP_SERVICE_PORT) || 50059;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.MEMBERSHIP,
    CONSULT_SERVICE_ID.MEMBERSHIP,
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
        package: ['subscription', 'package', 'grpc.health.v1'],
        protoPath: [
          join(process.cwd(), 'common/src/lib/proto/subscription.proto'),
          join(process.cwd(), 'common/src/lib/proto/package.proto'),
          join(process.cwd(), 'common/src/lib/proto/health.proto'),
        ],
        url: `0.0.0.0:${port}`,
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
}
bootstrap();
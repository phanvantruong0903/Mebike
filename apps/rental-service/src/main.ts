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
/**
 * Bootstraps the Nest application: loads environment variables, registers the service with Consul,
 * applies global validation and exception handling, connects gRPC and Kafka microservices, and starts them.
 *
 * This performs process-wide setup including determining host/port, registering the RENTAL service in Consul,
 * configuring ValidationPipe and GrpcExceptionFilter, loading protobuf definitions for gRPC, configuring Kafka
 * client/consumer settings, and starting all connected microservices.
 */
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

  await app.startAllMicroservices();
}
bootstrap();

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
  const port = Number(process.env.FLEET_SERVICE_PORT) || 50054;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.FLEET,
    CONSULT_SERVICE_ID.FLEET,
    host,
    port,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: ['supplier', 'grpc.health.v1'],
        protoPath: [
          join(process.cwd(), 'common/src/lib/proto/supplier.proto'),
          join(process.cwd(), 'common/src/lib/proto/health.proto'),
        ],
        url: `0.0.0.0:${process.env.FLEET_SERVICE_PORT}`,
      },
    },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GrpcExceptionFilter());
  await app.listen();
}
bootstrap();

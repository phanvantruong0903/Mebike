import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  ConsulService,
  CONSULT_SERVICE_ID,
  GrpcExceptionFilter,
} from '@loginex/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { config as dotenvConfig } from 'dotenv';
async function bootstrap() {
  dotenvConfig();

  const consulService = new ConsulService();
  const port = Number(process.env.INVENTORY_SERVICE_PORT) || 50053;
  const host = consulService.getLocalIp();

  await consulService.registerService(
    CONSULT_SERVICE_ID.INVENTORY,
    CONSULT_SERVICE_ID.INVENTORY,
    host,
    port,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: ['inventory', 'grpc.health.v1'],
        protoPath: [
          join(process.cwd(), 'common/src/lib/proto/inventory-shared.proto'),
          join(process.cwd(), 'common/src/lib/proto/warehouse.proto'),
          join(process.cwd(), 'common/src/lib/proto/zone.proto'),
          join(process.cwd(), 'common/src/lib/proto/rack.proto'),
          join(process.cwd(), 'common/src/lib/proto/bin.proto'),
          join(process.cwd(), 'common/src/lib/proto/stock.proto'),
          join(process.cwd(), 'common/src/lib/proto/product.proto'),
          join(process.cwd(), 'common/src/lib/proto/health.proto'),
        ],
        url: `0.0.0.0:${port}`,
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

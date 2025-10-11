import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { GrpcExceptionFilter } from '@mebike/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { config as dotenvConfig } from 'dotenv';
async function bootstrap() {
  dotenvConfig();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: ['user', 'grpc.health.v1'],
        protoPath: [
          join(__dirname, '../../../common/src/lib/proto/user.proto'),
          join(__dirname, '../../../common/src/lib/proto/health.proto'),
        ],
        url: `0.0.0.0:${process.env.USER_SERVICE_PORT}`,
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

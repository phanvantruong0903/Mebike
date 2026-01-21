import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { RpcExceptionsFilter } from './filters/rpc-exception.filter';

import './modules/user/graphql/enum';
import './modules/supplier/graphql/enum';
import './modules/bike/graphql/enum';
import './modules/station/graphql/enum';
import './modules/transaction/graphql/enum';
import './modules/wallet/graphql/enum';
import './modules/rental/graphql/enum';
import './modules/reservation/graphql/enum';
import './modules/subscription/graphql/enum';
import './modules/package/graphql/enum';
import './modules/sos/graphql/enum';

async function bootstrap() {
  dotenv.config();

  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://studio.apollographql.com',
      process.env.FRONTEND_URL,
    ].filter((origin) => !!origin),
    credentials: true,
  });

  app.useGlobalFilters(new RpcExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('MeBike API')
    .setDescription('MeBike REST API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('bike', 'Bike management endpoints')
    .addTag('station', 'Station management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
}
bootstrap();

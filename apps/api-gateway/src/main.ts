import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import './modules/user/graphql/enum';
import './modules/supplier/graphql/enum';
import './modules/bike/graphql/enum';

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

  await app.listen(port);
}
bootstrap();

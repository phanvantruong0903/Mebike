import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import './modules/user/graphql/enum';
import './modules/warehouse/graphql/enum';
import './modules/zone/graphql/enum';
import './modules/product/graphql/enum';

async function bootstrap() {
  dotenv.config();

  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://studio.apollographql.com',
      `http://localhost:${port}`,
      process.env.DOMAIN,
    ],
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();

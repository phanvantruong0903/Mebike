import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionModule } from '../modules/subscription/subscription.module';
import { PackageModule } from '../modules/package/package.module';

@Module({
  imports: [SubscriptionModule, PackageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

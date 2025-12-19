import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from '../modules/notification.module';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [NotificationModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SosModule } from '../modules/sos/sos.module';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [SosModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

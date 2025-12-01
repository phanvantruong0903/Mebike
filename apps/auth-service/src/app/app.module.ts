import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/users/auth.module';
import { HealthController } from '../health/health.controller';
import { ConsuleModule } from '@loginex/common';

import { SeedService } from '../modules/users/seed.service';

@Module({
  imports: [AuthModule, ConsuleModule],
  controllers: [AppController, HealthController],
  providers: [AppService, SeedService],
})
export class AppModule {}

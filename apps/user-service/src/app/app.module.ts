import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../modules/users/user.module';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [UserModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

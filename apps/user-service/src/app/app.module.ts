import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../modules/users/user.module';
import { ConsulService } from '../consul/consul.service';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [UserModule],
  controllers: [AppController, HealthController],
  providers: [AppService, ConsulService],
})
export class AppModule {}

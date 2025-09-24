import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../modules/users/user.module';
import { UserConsulRegistrar } from '../consul/consul.service';
import { HealthController } from '../health/health.controller';
import { ConsuleModule } from '@mebike/common';

@Module({
  imports: [UserModule, ConsuleModule],
  controllers: [AppController, HealthController],
  providers: [AppService, UserConsulRegistrar],
})
export class AppModule {}

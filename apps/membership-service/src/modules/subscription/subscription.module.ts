import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { ConfigModule } from '@nestjs/config';
import { ConsulModule } from '@mebike/common';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [ConsulModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}

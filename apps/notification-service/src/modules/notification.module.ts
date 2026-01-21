import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: 'RESEND',
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('RESEND_API_KEY');
        return new Resend(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['RESEND'],
})
export class NotificationModule {}

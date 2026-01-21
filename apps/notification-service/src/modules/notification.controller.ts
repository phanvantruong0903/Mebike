import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPIC } from '@mebike/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Handlebars from 'handlebars';

@Controller()
export class NotificationController {
  constructor(
    @Inject('RESEND') private readonly resend: Resend,
    private readonly configService: ConfigService,
  ) {}

  @EventPattern(KAFKA_TOPIC.USER_RESET_PASSWORD)
  async sendMail(@Payload() data: any) {
    await this.sendEmailNotification(data);
  }

  @EventPattern(KAFKA_TOPIC.WELCOME_EMAIL)
  async sendWelcomeEmail(@Payload() data: any) {
    await this.sendEmailNotification(data);
  }

  @EventPattern(KAFKA_TOPIC.VERIFY_EMAIL)
  async sendVerifyEmail(@Payload() data: any) {
    await this.sendEmailNotification(data);
  }

  private async sendEmailNotification(data: any) {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        `${data.template}.hbs`,
      );
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateSource);
      const html = template(data.data);

      await this.resend.emails.send({
        from:
          this.configService.get<string>('MAIL_FROM') ?? 'mebike@security.com',
        to: data.to,
        subject: data.subject,
        html: html,
      });
    } catch (error) {
      console.error(
        `[Notification Service] Failed to send email to: ${data.to}`,
      );
      console.error(error);
    }
  }
}

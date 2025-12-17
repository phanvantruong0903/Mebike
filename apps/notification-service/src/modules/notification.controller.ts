import { Controller } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPIC } from '@mebike/common';

@Controller()
export class NotificationController {
  constructor(private readonly mailerService: MailerService) {}

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
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        template: data.template,
        context: data.data,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

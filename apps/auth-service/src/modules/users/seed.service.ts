import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  KAFKA_TOPIC,
  prismaAuth,
  Role,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  CreateProfileDto,
} from '@loginex/common';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  async onModuleInit() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin.loginex@gmail.com';
    const adminPassword =
      process.env.ADMIN_PASSWORD || 'admin.loginex@gmail.com';

    try {
      const existingUser = await prismaAuth.user.findUnique({
        where: { email: adminEmail },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const user = await prismaAuth.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
          },
        });

        const profileData: CreateProfileDto = {
          YOB: 2000,
          name: 'Admin LogiNex',
          accountId: user.id,
          role: Role.ADMIN,
        };

        const kafkaClient = new ClientKafka({
          client: {
            clientId: KAFKA_CLIENT_ID.AUTH_SERVICE,
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          },
          consumer: {
            groupId: KAFKA_GROUP_ID.AUTH_SERVICE,
          },
        });

        await kafkaClient.connect();
        kafkaClient.emit(KAFKA_TOPIC.USER_CREATED, {
          key: user.id,
          value: profileData,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await kafkaClient.close();

        console.log('Admin user seeded and profile creation event emitted');
      } else {
        console.log('Admin user already exists.');
      }
    } catch (error) {
      console.error('Failed to seed admin user', error);
    }
  }
}

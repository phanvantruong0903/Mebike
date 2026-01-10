import {
  BaseService,
  CreateSubscriptionDto,
  prismaMembership,
  SUBSCRIPTION_MESSAGES,
  SubscriptionModel,
  SubscriptionStatus,
} from '@mebike/common';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class SubscriptionService extends BaseService<
  SubscriptionModel,
  CreateSubscriptionDto
> {
  constructor() {
    super(prismaMembership.subscription);
  }

  override async create(
    data: CreateSubscriptionDto,
  ): Promise<SubscriptionModel> {
    return await prismaMembership.subscription.create({
      data: {
        ...data,
      },
    });
  }

  async activate(id: string): Promise<SubscriptionModel> {
    const activatedAt = new Date();
    const expiredAt = this.generateExpirationDate(activatedAt);

    try {
      const result = await prismaMembership.subscription.updateMany({
        where: {
          id,
          status: SubscriptionStatus.Pending,
        },
        data: {
          status: SubscriptionStatus.Active,
          activatedAt,
          expiredAt,
        },
      });

      if (result.count === 0) {
        throw new ConflictException(
          SUBSCRIPTION_MESSAGES.NOT_FOUND_WITH_STATUS(
            SubscriptionStatus.Pending,
          ),
        );
      }

      return await prismaMembership.subscription.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to activate subscription');
    }
  }

  async expire(id: string): Promise<SubscriptionModel> {
    const result = await prismaMembership.subscription.updateMany({
      where: { id, status: SubscriptionStatus.Active },
      data: { status: SubscriptionStatus.Expired },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        SUBSCRIPTION_MESSAGES.NOT_FOUND_WITH_STATUS(SubscriptionStatus.Active),
      );
    }

    return await prismaMembership.subscription.findUniqueOrThrow({
      where: { id },
    });
  }

  async getOne(id: string): Promise<SubscriptionModel | null> {
    const subscription = await prismaMembership.subscription.findUnique({
      where: { id },
    });
    return subscription;
  }

  generateExpirationDate(date: Date): Date {
    return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

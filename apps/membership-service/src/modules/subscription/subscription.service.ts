import {
  BaseService,
  CreateSubscriptionDto,
  prismaMembership,
  SERVER_MESSAGE,
  SUBSCRIPTION_MESSAGES,
  SubscriptionModel,
  SubscriptionStatus,
  throwGrpcError,
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
    const existingSubsription = await prismaMembership.subscription.findFirst({
      where: {
        accountId: data.accountId,
        status: { in: [SubscriptionStatus.Pending, SubscriptionStatus.Active] },
      },
    });
    if (existingSubsription) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        SUBSCRIPTION_MESSAGES.ALREADY_HAVE_SUBSCRIPTION,
      ]);
    }
    return await prismaMembership.package
      .findUniqueOrThrow({
        where: { id: data.packageId },
      })
      .then(async () => {
        return await prismaMembership.subscription.create({
          data: {
            accountId: data.accountId,
            packageId: data.packageId,
            ...(data.isActivated && {
              status: SubscriptionStatus.Active,
              activatedAt: new Date(),
              expiredAt: this.generateExpirationDate(new Date()),
            }),
          },
        });
      })
      .catch((error) => {
        if (error instanceof NotFoundException) throw error;
        throwGrpcError(409, SERVER_MESSAGE.DATABASE_ERROR, [
          SUBSCRIPTION_MESSAGES.CREATE_FAILED,
        ]);
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

  async checkSubscriptionOwner(
    where: { id: string; status?: SubscriptionStatus },
    accountId: string,
  ): Promise<void> {
    const subscription = await prismaMembership.subscription.findUnique({
      where,
    });
    if (!subscription) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        SUBSCRIPTION_MESSAGES.NOT_FOUND,
      ]);
    }
    if (subscription.accountId !== accountId) {
      throwGrpcError(403, SERVER_MESSAGE.FORBIDDEN, [
        SUBSCRIPTION_MESSAGES.CANNOT_ACTIVATE_OTHER_USER_SUBSCRIPTION,
      ]);
    }
  }
}

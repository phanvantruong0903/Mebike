import {
  ApiResponse,
  BaseService,
  CreateSubscriptionDto,
  DebitSubscriptionDto,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  PACKAGE_MESSAGES,
  prismaMembership,
  SERVER_MESSAGE,
  SUBSCRIPTION_MESSAGES,
  SubscriptionModel,
  SubscriptionStatus,
  throwGrpcError,
} from '@mebike/common';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RpcException, type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface PaymentServiceClient {
  DebitSubscription(data: DebitSubscriptionDto): Observable<ApiResponse>;
}

@Injectable()
export class SubscriptionService extends BaseService<
  SubscriptionModel,
  CreateSubscriptionDto
> {
  private readonly paymentService: PaymentServiceClient;
  constructor(
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly client: ClientGrpc,
  ) {
    super(prismaMembership.subscription);
    this.paymentService = this.client.getService<PaymentServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
  }

  override async create(
    data: CreateSubscriptionDto,
  ): Promise<SubscriptionModel> {
    const existingSubscription = await prismaMembership.subscription.findFirst({
      where: {
        accountId: data.accountId,
        status: { in: [SubscriptionStatus.Pending, SubscriptionStatus.Active] },
      },
    });

    if (existingSubscription) {
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        SUBSCRIPTION_MESSAGES.ALREADY_HAVE_SUBSCRIPTION,
      ]);
    }

    const pkg = await prismaMembership.package.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg) {
      throwGrpcError(404, SERVER_MESSAGE.NOT_FOUND, [
        PACKAGE_MESSAGES.NOT_FOUND,
      ]);
    }

    let subscription = await prismaMembership.subscription.create({
      data: {
        accountId: data.accountId,
        packageId: data.packageId,
        status: SubscriptionStatus.Pending,
      },
    });

    let debitResponse;
    try {
      debitResponse = await this.debitSubscription({
        accountId: data.accountId,
        amount: Number(pkg.price),
        subscriptionId: subscription.id,
      });
    } catch (error) {
      await this.handlePaymentFailure(subscription.id);
      throwGrpcError(500, SERVER_MESSAGE.INTERNAL_SERVER, [
        'Payment service unavailable',
      ]);
    }

    if (!debitResponse.success) {
      await this.handlePaymentFailure(subscription.id);
      throwGrpcError(400, SERVER_MESSAGE.BAD_REQUEST, [
        SUBSCRIPTION_MESSAGES.CREATE_FAILED,
      ]);
    }

    try {
      subscription = await prismaMembership.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.Active,
          activatedAt: new Date(),
          expiredAt: this.generateExpirationDate(new Date()),
        },
      });
    } catch (dbError) {
      throwGrpcError(500, SERVER_MESSAGE.DATABASE_ERROR, [
        SUBSCRIPTION_MESSAGES.ACTIVATE_FAILED,
      ]);
    }

    return subscription;
  }

  private async handlePaymentFailure(subId: string) {
    await prismaMembership.subscription.delete({
      where: { id: subId },
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
      throw new InternalServerErrorException(
        SUBSCRIPTION_MESSAGES.ACTIVATE_FAILED,
      );
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

  async debitSubscription(data: DebitSubscriptionDto): Promise<ApiResponse> {
    return firstValueFrom(this.paymentService.DebitSubscription(data));
  }
}

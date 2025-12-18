import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Role,
  PaymentResponse,
  GRAPHQL_NAME_PAYMENT,
  CreatePaymentInput,
  getClientIp,
  UserProfile,
} from '@mebike/common';
import { RoleGuard } from '../auth/role.guard';
import { PaymentService } from './payment.service';
import { Roles } from '../auth/role.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => PaymentResponse, { name: GRAPHQL_NAME_PAYMENT.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  async createPayment(
    @Args('body') body: CreatePaymentInput,
    @Context() context: any,
    @CurrentUser() user: UserProfile,
  ): Promise<PaymentResponse> {
    const ipAddr = getClientIp(context.req);

    return this.paymentService.createPayment({
      ...body,
      ipAddr,
      accountId: user.accountId,
    });
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}

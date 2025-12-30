import { Controller, Get, Res, HttpStatus, Query } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('vnpay_return')
  async vnpayReturn(@Res() res: Response, @Query() query: any) {
    const orderInfo = query.vnp_OrderInfo;
    const amount = query.vnp_Amount;

    const parts = orderInfo.split(' ');
    const accountId = parts[parts.length - 1];

    try {
      await this.paymentService.depositCallback({
        accountId,
        amount: Number(amount) / 100,
        description: orderInfo,
      });
      const redirectUrl = 'https://facebook.com';
      return res.redirect(HttpStatus.FOUND, redirectUrl);
    } catch (error) {
      console.log('Error in vnpay callback:', error);
      return res.redirect(HttpStatus.FOUND, 'https://facebook.com');
    }
  }
}

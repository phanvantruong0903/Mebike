import {
  CreateProfileDto,
  CreateWalletDto,
  GRPC_PACKAGE,
  GRPC_SERVICES,
  KAFKA_SERVICE,
  KAFKA_TOPIC,
  UserResponse,
} from '@mebike/common';
import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc, ClientKafka } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { AuthService } from '../modules/users/auth.service';

interface UserServiceClient {
  CreateUser(input: CreateProfileDto): Observable<UserResponse>;
  DeleteUser(input: { accountId: string }): Observable<UserResponse>;
}

interface WalletServiceClient {
  CreateWallet(input: CreateWalletDto): Observable<any>;
}

@Injectable()
export class UserCreationActivity {
  private readonly userService: UserServiceClient;
  private readonly paymentService: WalletServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.USER) private readonly client: ClientGrpc,
    @Inject(GRPC_PACKAGE.PAYMENT) private readonly paymentClient: ClientGrpc,
    @Inject(KAFKA_SERVICE.AUTH_SERVICE)
    private readonly kafkaClient: ClientKafka,
    private readonly authService: AuthService,
  ) {
    this.userService = this.client.getService<UserServiceClient>(
      GRPC_SERVICES.USER,
    );
    this.paymentService = this.paymentClient.getService<WalletServiceClient>(
      GRPC_SERVICES.PAYMENT,
    );
  }

  async createUserProfile(data: CreateProfileDto) {
    const response = await lastValueFrom(this.userService.CreateUser(data));
    if (!response.success) {
      throw new Error(response.message);
    }
  }

  async createWallet(data: CreateWalletDto) {
    const response = await lastValueFrom(
      this.paymentService.CreateWallet(data),
    );
    if (!response.success) {
      throw new Error(response.message);
    }
  }

  async sendWelcomeEmail(data: { key: string; email: string; name: string }) {
    this.kafkaClient
      .emit(KAFKA_TOPIC.WELCOME_EMAIL, {
        key: data.key,
        value: {
          to: data.email,
          subject: 'Welcome to Mebike',
          template: 'welcome',
          data: {
            name: data.name,
          },
        },
      })
      .subscribe();
  }

  async deleteUserProfile(data: { accountId: string }) {
    console.log(
      '[COMPENSATION] Attempting to delete user profile:',
      data.accountId,
    );
    try {
      const response = await lastValueFrom(this.userService.DeleteUser(data));
      if (!response.success) {
        console.warn('[COMPENSATION] Delete profile failed:', response.message);
      } else {
        console.log('[COMPENSATION] Delete profile success:', data.accountId);
      }
    } catch (error: any) {
      console.error('[COMPENSATION] Delete profile error:', error?.message);
    }
  }

  async deleteAccount(data: { accountId: string }) {
    console.log('[COMPENSATION] Attempting to delete account:', data.accountId);
    try {
      const response = await this.authService.deleteAccount(data.accountId);
      if (!response.success) {
        console.warn('[COMPENSATION] Delete account failed:', response.message);
      } else {
        console.log('[COMPENSATION] Delete account success:', data.accountId);
      }
    } catch (error: any) {
      console.error('[COMPENSATION] Delete account error:', error?.message);
    }
  }
}

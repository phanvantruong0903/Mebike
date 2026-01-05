import * as AuthPrismaInternal from './auth/generated';
import * as UserPrismaInternal from './user/generated';
import * as FleetPrismaInternal from './fleet/generated';
import * as PaymentPrismaInternal from './payment/generated';
import * as RentalPrismaInternal from './rental/generated';
import * as MembershipPrismaInternal from './membership/generated';

export * as AuthPrisma from './auth/generated';
export * as UserPrisma from './user/generated';
export * as FleetPrisma from './fleet/generated';
export * as PaymentPrisma from './payment/generated';
export * as RentalPrisma from './rental/generated';
export * as MembershipPrisma from './membership/generated';

// Singleton pattern to prevent multiple instances during hot reload
const globalForPrisma = global as unknown as {
  prismaAuth: AuthPrismaInternal.PrismaClient | undefined;
  prismaUser: UserPrismaInternal.PrismaClient | undefined;
  prismaFleet: FleetPrismaInternal.PrismaClient | undefined;
  prismaPayment: PaymentPrismaInternal.PrismaClient | undefined;
  prismaRental: RentalPrismaInternal.PrismaClient | undefined;
  prismaMembership: MembershipPrismaInternal.PrismaClient | undefined;
};

export const prismaAuth =
  globalForPrisma.prismaAuth ??
  new AuthPrismaInternal.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const prismaUser =
  globalForPrisma.prismaUser ??
  new UserPrismaInternal.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const prismaFleet =
  globalForPrisma.prismaFleet ??
  new FleetPrismaInternal.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const prismaPayment =
  globalForPrisma.prismaPayment ??
  new PaymentPrismaInternal.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const prismaRental =
  globalForPrisma.prismaRental ??
  new RentalPrismaInternal.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const prismaMembership =
  globalForPrisma.prismaMembership ??
  new MembershipPrismaInternal.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaAuth = prismaAuth;
  globalForPrisma.prismaUser = prismaUser;
  globalForPrisma.prismaFleet = prismaFleet;
  globalForPrisma.prismaPayment = prismaPayment;
  globalForPrisma.prismaRental = prismaRental;
  globalForPrisma.prismaMembership = prismaMembership;
}

export type User = AuthPrismaInternal.User;
export type Profile = UserPrismaInternal.Profile;
export type SupplierModel = FleetPrismaInternal.Supplier;
export type StationModel = FleetPrismaInternal.Station;
export type BikeModel = FleetPrismaInternal.Bike;
export type TransactionModel = PaymentPrismaInternal.Transaction;
export type WalletModel = PaymentPrismaInternal.Wallet;
export type WalletHistoryModel = PaymentPrismaInternal.WalletHistory;
export type WithdrawModel = PaymentPrismaInternal.Withdraw;
export type RentalModel = RentalPrismaInternal.Rental;
export type ReservationModel = RentalPrismaInternal.Reservation;
export type SubscriptionModel = MembershipPrismaInternal.Subscription;
export type PackageModel = MembershipPrismaInternal.Package;
export { Role, UserVerifyStatus, UserStatus } from './user/generated';
export { SupplierStatus, BikeStatus, StationStatus } from './fleet/generated';
export {
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  WalletStatus,
  WithdrawStatus,
} from './payment/generated';
export { RentalStatus, ReservationStatus } from './rental/generated';
export {
  SubscriptionStatus,
  PackageStatus,
  UsageType,
} from './membership/generated';

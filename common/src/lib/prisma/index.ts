import * as AuthPrismaInternal from './auth/generated';
import * as UserPrismaInternal from './user/generated';
import * as InventoryPrismaInternal from './inventory/generated';

export * as AuthPrisma from './auth/generated';
export * as UserPrisma from './user/generated';
export * as InventoryPrisma from './inventory/generated';

// Singleton pattern to prevent multiple instances during hot reload
const globalForPrisma = global as unknown as {
  prismaAuth: AuthPrismaInternal.PrismaClient | undefined;
  prismaUser: UserPrismaInternal.PrismaClient | undefined;
  prismaInventory: InventoryPrismaInternal.PrismaClient | undefined;
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

export const prismaInventory =
  globalForPrisma.prismaInventory ??
  new InventoryPrismaInternal.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaAuth = prismaAuth;
  globalForPrisma.prismaUser = prismaUser;
  globalForPrisma.prismaInventory = prismaInventory;
}

export type User = AuthPrismaInternal.User;
export type Profile = UserPrismaInternal.Profile;
export type Product = InventoryPrismaInternal.Product;
export type RackModel = InventoryPrismaInternal.Rack;
export type WareHouse = InventoryPrismaInternal.WareHouse;
export type ZoneModel = InventoryPrismaInternal.Zone;
export type BinModel = InventoryPrismaInternal.Bin;
export { Role, UserVerifyStatus, UserStatus } from './user/generated';
export {
  ZoneType,
  ProductStatus,
  WarehouseStatus,
} from './inventory/generated';

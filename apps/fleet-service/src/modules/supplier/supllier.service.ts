import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  BaseService,
  BikeStatus,
  CreateSupplierDto,
  SupplierModel,
  SupplierStatus,
  UpdateSupplierDto,
  prismaFleet,
  throwGrpcError,
  SUPPLIER_MESSAGES,
  REDIS_CONSTANTS,
  meiliClient,
  GetSupplierDto,
} from '@mebike/common';
import Redis from 'ioredis';
import { createCache } from 'async-cache-dedupe';

@Injectable()
export class SupplierService
  extends BaseService<SupplierModel, CreateSupplierDto, UpdateSupplierDto>
  implements OnModuleInit
{
  private readonly requestDedup;
  constructor(
    @Inject(REDIS_CONSTANTS.REDIS_CLIENT) private readonly redisClient: Redis,
  ) {
    super(prismaFleet.supplier);
    this.requestDedup = createCache({
      ttl: 5,
      storage: {
        type: 'memory',
      },
    });
    this.requestDedup.define('fetchSupplierById', {}, async (id: string) => {
      const key = `supplier:${id}`;
      const cacheSupplier = await redisClient.get(key);

      if (cacheSupplier) return JSON.parse(cacheSupplier);
      const supplier = await prismaFleet.supplier.findUnique({
        where: { id },
        include: {
          bikes: {
            include: {
              station: true,
            },
          },
          _count: {
            select: {
              bikes: true,
            },
          },
        },
      });

      if (supplier) await this.cacheSupplierToRedis(supplier, 3600);
      return supplier;
    });
  }

  async onModuleInit() {
    await this.createSupplierIndex();
  }

  async cacheSupplierToRedis(supplier: SupplierModel, ttlSecond: number) {
    const key = `supplier:${supplier.id}`;
    await this.redisClient.set(key, JSON.stringify(supplier), 'EX', ttlSecond);
  }

  async createSupplierIndex() {
    try {
      await meiliClient.getIndex('Supplier');
    } catch {
      await meiliClient.createIndex('Supplier', { primaryKey: 'id' });
    }
    await meiliClient.index('Supplier').updateSettings({
      searchableAttributes: ['name', 'id'],
      filterableAttributes: ['status'],
      sortableAttributes: ['createdAt'],
    });
  }

  async getSupplierStat() {
    const [stats, bikeStats] = await Promise.all([
      (prismaFleet.supplier.groupBy as any)({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      (prismaFleet.bike.groupBy as any)({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
    ]);

    const totalCount = stats.reduce(
      (acc: number, curr: any) => acc + curr._count.id,
      0,
    );

    const bikeCount = bikeStats.reduce(
      (acc: number, curr: any) => acc + curr._count.id,
      0,
    );

    const result = {
      totalSupplier: totalCount,
      totalBike: bikeCount,
      totalAvailableBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Available)
          ?._count.id ?? 0,
      totalBookedBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Booked)?._count
          .id ?? 0,
      totalBrokenBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Broken)?._count
          .id ?? 0,
      totalReservedBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Reserved)
          ?._count.id ?? 0,
      totalMaintainedBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Maintained)
          ?._count.id ?? 0,
      totalUnAvailableBike:
        bikeStats.find((item: any) => item.status === BikeStatus.Unavailable)
          ?._count.id ?? 0,
      totalSupplierActive:
        stats.find((item: any) => item.status === SupplierStatus.Active)?._count
          .id ?? 0,
      totalSupplierInactive:
        stats.find((item: any) => item.status === SupplierStatus.Inactive)
          ?._count.id ?? 0,
    };

    return result;
  }

  async getSupplierDetail(id: string) {
    const supplier = await (this.requestDedup as any).fetchSupplierById(id);
    if (!supplier) {
      throwGrpcError(404, SUPPLIER_MESSAGES.NOT_FOUND, [
        SUPPLIER_MESSAGES.NOT_FOUND,
      ]);
    }

    const searchSupplier = await meiliClient.index('Bike').search('', {
      filter: `supplierId = "${supplier.id}"`,
      facets: ['status'],
      limit: 0,
    });

    const supplierStats = searchSupplier.facetDistribution?.status || {};
    const supplierWithStat = {
      ...supplier,
      totalBikes: supplier._count.bikes,
      availableBikes: supplierStats[BikeStatus.Available] || 0,
      bookedBikes: supplierStats[BikeStatus.Booked] || 0,
      reservedBikes: supplierStats[BikeStatus.Reserved] || 0,
      maintainedBikes: supplierStats[BikeStatus.Maintained] || 0,
      unavailableBikes: supplierStats[BikeStatus.Unavailable] || 0,
    };

    return supplierWithStat;
  }

  async updateSupplier(
    id: string,
    data: UpdateSupplierDto & { address?: string; phone?: string },
  ) {
    const currentSupplier = await prismaFleet.supplier.findUnique({
      where: { id },
    });

    if (!currentSupplier) {
      throwGrpcError(404, SUPPLIER_MESSAGES.NOT_FOUND, [
        SUPPLIER_MESSAGES.NOT_FOUND,
      ]);
    }

    const oldContactInfo = (currentSupplier.contactInfo as any) || {};
    const newContactInfo = {
      ...oldContactInfo,
    };

    if (data.address) newContactInfo.address = data.address;
    if (data.phone) newContactInfo.phone = data.phone;

    const updateData: any = {
      ...data,
      contactInfo: newContactInfo,
    };

    delete updateData.address;
    delete updateData.phone;

    const result = await this.update(id, updateData);
    if (result) await this.cacheSupplierToRedis(result, 3600);

    return result;
  }

  async createSupplier(
    data: CreateSupplierDto & {
      address: string;
      phone: string;
    },
  ) {
    const supplierData = {
      name: data.name,
      contactFee: data.contactFee,
      contactInfo: {
        address: data.address,
        phone: data.phone,
      },
    };
    const result = await this.create(
      supplierData as unknown as CreateSupplierDto,
    );

    if (result) this.cacheSupplierToRedis(result, 3600);
    return result;
  }

  async changeSupplierStatus(id: string, status: SupplierStatus) {
    const supplier = await prismaFleet.supplier.update({
      where: { id },
      data: { status },
    });

    if (supplier) await this.cacheSupplierToRedis(supplier, 3600);
    return supplier;
  }

  async getSuppliersByIds(ids: string[]) {
    const result = await prismaFleet.supplier.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return result;
  }

  async getSupplierStats(id: string) {
    const supplier = await (this.requestDedup as any).fetchSupplierById(id);
    if (!supplier) {
      throwGrpcError(404, SUPPLIER_MESSAGES.NOT_FOUND, [
        SUPPLIER_MESSAGES.NOT_FOUND,
      ]);
    }

    const searchSupplier = await meiliClient.index('Bike').search('', {
      filter: `supplierId = "${supplier.id}"`,
      facets: ['status'],
      limit: 0,
    });

    const supplierStats = searchSupplier.facetDistribution?.status || {};
    const supplierWithStat = {
      totalBikes: supplier._count.bikes,
      availableBikes: supplierStats[BikeStatus.Available] || 0,
      bookedBikes: supplierStats[BikeStatus.Booked] || 0,
      reservedBikes: supplierStats[BikeStatus.Reserved] || 0,
      maintainedBikes: supplierStats[BikeStatus.Maintained] || 0,
      unavailableBikes: supplierStats[BikeStatus.Unavailable] || 0,
    };

    return supplierWithStat;
  }

  async getAllSuppliers(data: GetSupplierDto) {
    const { page, limit, status } = data;
    const filter: string[] = [];

    if (status) filter.push(`status = "${status}"`);
    const result = await meiliClient.index('Supplier').search('', {
      filter,
      sort: ['createdAt:desc'],
      limit,
      offset: (page - 1) * limit,
      attributesToRetrieve: ['id'],
    });

    console.log(result);

    const supplierIds = result.hits.map((hit) => hit.id);
    if (supplierIds.length === 0) {
      return {
        data: [],
        total: result.estimatedTotalHits,
        page,
        limit,
        totalPages: 0,
      };
    }

    const redisKeys = supplierIds.map((id) => `supplier:${id}`);
    const cachedSuppliers = await this.redisClient.mget(redisKeys);

    const suppliers: SupplierModel[] = [];
    const missingIds: string[] = [];

    cachedSuppliers.forEach((item, index) => {
      if (item) suppliers.push(JSON.parse(item));
      else missingIds.push(supplierIds[index]);
    });

    if (missingIds.length > 0) {
      const missingSuppliers = await prismaFleet.supplier.findMany({
        where: { id: { in: missingIds } },
      });

      const pipeline = this.redisClient.pipeline();
      missingSuppliers.forEach((sup) => {
        suppliers.push(sup);
        pipeline.set(`supplier:${sup.id}`, JSON.stringify(sup), 'EX', 3600);
      });
      await pipeline.exec();
    }

    const response = supplierIds.map((supplierId) =>
      suppliers.find((supplier) => supplier.id === supplierId),
    );

    return {
      data: response,
      total: result.estimatedTotalHits,
      page,
      limit,
      totalPages: Math.ceil(result.estimatedTotalHits / limit),
    };
  }
}

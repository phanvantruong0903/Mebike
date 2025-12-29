import { Injectable } from '@nestjs/common';
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
} from '@mebike/common';

@Injectable()
export class SupplierService extends BaseService<
  SupplierModel,
  CreateSupplierDto,
  UpdateSupplierDto
> {
  constructor() {
    super(prismaFleet.supplier);
  }

  async getSupplierStat() {
    const [stats, bikeStats] = await Promise.all([
      prismaFleet.supplier.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      prismaFleet.bike.groupBy({
        by: ['status'],
        where: {
          supplierId: {
            not: undefined,
          },
        },
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
    const result = await prismaFleet.supplier.findUnique({
      where: { id },
      include: {
        bikes: {
          include: {
            station: true,
          },
        },
      },
    });
    if (!result) {
      throwGrpcError(404, SUPPLIER_MESSAGES.NOT_FOUND, [
        SUPPLIER_MESSAGES.NOT_FOUND,
      ]);
    }

    return result as unknown as SupplierModel;
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

    return result;
  }

  async changeSupplierStatus(id: string, status: SupplierStatus) {
    const profile = await prismaFleet.supplier.update({
      where: { id },
      data: { status },
    });
    return profile;
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
}

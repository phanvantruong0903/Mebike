import { Injectable, NotFoundException } from '@nestjs/common';
import { prismaInventory } from '@loginex/common';

@Injectable()
export class StockService {
  async getStockLevel(data: { productId: string; warehouseId?: string }) {
    const { productId, warehouseId } = data;

    const where: any = {
      productId,
    };

    if (warehouseId) {
      where.bin = {
        Rack: {
          Zone: {
            wareHouseId: warehouseId,
          },
        },
      };
    }

    const binItems = await prismaInventory.binItem.findMany({
      where,
      include: {
        bin: true,
      },
    });

    const totalQuantity = binItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const details = binItems.map((item) => ({
      binId: item.binId,
      binCode: item.bin.code,
      quantity: item.quantity,
    }));

    return {
      productId,
      totalQuantity,
      details,
    };
  }

  async adjustStock(data: {
    binId: string;
    productId: string;
    quantityChange: number;
    reason: string;
  }) {
    const { binId, productId, quantityChange } = data;

    // Check if bin exists
    const bin = await prismaInventory.bin.findUnique({
      where: { id: binId },
    });
    if (!bin) {
      throw new NotFoundException('Bin not found');
    }

    // Check if product exists
    const product = await prismaInventory.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Upsert bin item
    const binItem = await prismaInventory.binItem.findUnique({
      where: {
        binId_productId: {
          binId,
          productId,
        },
      },
    });

    let newQuantity = 0;
    if (binItem) {
      newQuantity = binItem.quantity + quantityChange;
    } else {
      newQuantity = quantityChange;
    }

    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    if (newQuantity === 0) {
      await prismaInventory.binItem.delete({
        where: {
          binId_productId: {
            binId,
            productId,
          },
        },
      });
    } else {
      await prismaInventory.binItem.upsert({
        where: {
          binId_productId: {
            binId,
            productId,
          },
        },
        update: {
          quantity: newQuantity,
        },
        create: {
          binId,
          productId,
          quantity: newQuantity,
        },
      });
    }

    // Update bin weight/volume
    const weightChange = product.weight * quantityChange;
    const volumeChange = product.volume * quantityChange;

    await prismaInventory.bin.update({
      where: { id: binId },
      data: {
        currWeight: { increment: weightChange },
        currVolume: { increment: volumeChange },
      },
    });

    // Return updated stock level
    return this.getStockLevel({ productId });
  }
}

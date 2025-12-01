import {
  BaseService,
  CreateProductDto,
  prismaInventory,
  Product,
  UpdateProductDto,
} from '@loginex/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService extends BaseService<
  Product,
  CreateProductDto,
  UpdateProductDto
> {
  constructor() {
    super(prismaInventory.product);
  }
}

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import {
  GRPC_PACKAGE,
  GRPC_SERVICES,
  CreateProductInput,
  ProductResponse,
  ProductListResponse,
  UpdateProductInput,
  ChangeProductStatusInput,
} from '@loginex/common';

interface ProductServiceClient {
  GetAllProducts(data: {
    page: number;
    limit: number;
    search?: string;
  }): Observable<ProductListResponse>;
  GetProductDetail(data: { id: string }): Observable<ProductResponse>;
  UpdateProduct(
    data: { id: string } & UpdateProductInput,
  ): Observable<ProductResponse>;
  CreateProduct(data: CreateProductInput): Observable<ProductResponse>;
  ChangeStatus(data: ChangeProductStatusInput): Observable<ProductResponse>;
}

@Injectable()
export class ProductService implements OnModuleInit {
  private productService!: ProductServiceClient;

  constructor(
    @Inject(GRPC_PACKAGE.INVENTORY) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productService = this.client.getService<ProductServiceClient>(
      GRPC_SERVICES.PRODUCT,
    );
  }

  async getAllProduct(data: { page: number; limit: number }) {
    return await lastValueFrom(this.productService.GetAllProducts(data));
  }

  async getProductDetail(id: string) {
    return await firstValueFrom(this.productService.GetProductDetail({ id }));
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    return await firstValueFrom(
      this.productService.UpdateProduct({ id, ...data }),
    );
  }

  async createProduct(data: CreateProductInput) {
    return await firstValueFrom(this.productService.CreateProduct(data));
  }

  async changeStatusProduct(data: ChangeProductStatusInput) {
    return await firstValueFrom(this.productService.ChangeStatus(data));
  }
}

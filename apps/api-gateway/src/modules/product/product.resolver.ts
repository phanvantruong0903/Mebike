import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ProductResponse,
  GetProductsInput,
  ProductListResponse,
  Role,
  GRAPHQL_NAME_PRODUCT,
  CreateProductInput,
  UpdateProductInput,
  ChangeProductStatusInput,
} from '@loginex/common';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation(() => ProductResponse, { name: GRAPHQL_NAME_PRODUCT.CREATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async createProduct(
    @Args('body', { type: () => CreateProductInput }) body: CreateProductInput,
  ): Promise<ProductResponse> {
    return this.productService.createProduct(body);
  }

  @Mutation(() => ProductResponse, { name: GRAPHQL_NAME_PRODUCT.UPDATE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateProduct(
    @Args('body', { type: () => UpdateProductInput }) body: UpdateProductInput,
    @Args('id') id: string,
  ): Promise<ProductResponse> {
    return this.productService.updateProduct(id, body);
  }

  @Mutation(() => ProductResponse, { name: GRAPHQL_NAME_PRODUCT.GET_ONE })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getDetailProduct(@Args('id') id: string): Promise<ProductResponse> {
    return this.productService.getProductDetail(id);
  }

  @Query(() => ProductListResponse, {
    name: GRAPHQL_NAME_PRODUCT.GET_ALL,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getAllProduct(
    @Args('params', {
      nullable: true,
      type: () => GetProductsInput,
      defaultValue: {},
    })
    data?: GetProductsInput,
  ): Promise<ProductListResponse> {
    const page = data?.page ?? 1;
    const limit = data?.limit ?? 10;
    return this.productService.getAllProduct({ page, limit });
  }

  @Query(() => ProductResponse, {
    name: GRAPHQL_NAME_PRODUCT.GET_ONE,
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getProductDetail(@Args('id') id: string): Promise<ProductResponse> {
    return this.productService.getProductDetail(id);
  }

  @Mutation(() => ProductResponse, { name: GRAPHQL_NAME_PRODUCT.CHANGE_STATUS })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async changeStatus(
    @Args('data') data: ChangeProductStatusInput,
  ): Promise<ProductResponse> {
    return this.productService.changeStatusProduct(data);
  }

  @Query(() => String)
  _healthCheck(): string {
    return 'API is running';
  }
}

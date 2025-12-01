import { Field, ObjectType, Int } from '@nestjs/graphql';

type ClassType<T = any> = new (...args: any[]) => T;

interface ApiResponseOptions {
  isArray?: boolean;
}

export function ApiResponseType<TItem>(
  TItemClass: ClassType<TItem>,
  options: ApiResponseOptions = {},
) {
  const { isArray = false } = options;

  @ObjectType({ isAbstract: true })
  abstract class ApiResponseClass {
    @Field()
    success!: boolean;

    @Field()
    message!: string;

    @Field(() => (isArray ? [TItemClass] : TItemClass), { nullable: true })
    data?: TItem | TItem[];

    @Field(() => [String], { nullable: true })
    errors?: string[];
  }

  if (isArray) {
    @ObjectType({ isAbstract: true })
    abstract class ApiPaginatedResponseClass extends ApiResponseClass {
      @Field(() => Int, { nullable: true })
      total?: number;

      @Field(() => Int, { nullable: true })
      page?: number;

      @Field(() => Int, { nullable: true })
      limit?: number;

      @Field(() => Int, { nullable: true })
      totalPages?: number;
    }
    return ApiPaginatedResponseClass;
  }

  return ApiResponseClass;
}

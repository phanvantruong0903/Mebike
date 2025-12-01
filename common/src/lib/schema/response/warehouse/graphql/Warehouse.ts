import { Field, ID, ObjectType } from '@nestjs/graphql';
import { WarehouseStatus } from '../../../../prisma/index';

@ObjectType()
export class Warehouse {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  location!: string;

  @Field(() => WarehouseStatus)
  status!: WarehouseStatus;
}

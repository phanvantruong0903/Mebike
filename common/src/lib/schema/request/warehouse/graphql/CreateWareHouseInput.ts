import { Field, InputType } from '@nestjs/graphql';
import { WarehouseStatus } from '../../../../prisma/index';

@InputType()
export class CreateWareHouseInput {
  @Field()
  name!: string;

  @Field()
  location!: string;

  @Field(() => WarehouseStatus, { nullable: true })
  status?: WarehouseStatus;
}

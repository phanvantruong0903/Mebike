import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SupplierStats {
  @Field(() => Int)
  totalSupplier!: number;

  @Field(() => Int)
  totalSupplierActive!: number;

  @Field(() => Int)
  totalSupplierInactive!: number;

  @Field(() => Int)
  totalBike!: number;

  @Field(() => Int)
  totalAvailableBike!: number;

  @Field(() => Int)
  totalBookedBike!: number;

  @Field(() => Int)
  totalBrokenBike!: number;

  @Field(() => Int)
  totalReservedBike!: number;

  @Field(() => Int)
  totalMaintainedBike!: number;

  @Field(() => Int)
  totalUnAvailableBike!: number;
}

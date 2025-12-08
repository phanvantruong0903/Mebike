import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserStats {
  @Field(() => Int)
  totalUsers!: number;

  @Field(() => Int)
  totalUser!: number;

  @Field(() => Int)
  totalUserUnverfied!: number;

  @Field(() => Int)
  totalStaff!: number;

  @Field(() => Int)
  totalAdmin!: number;

  @Field(() => Int)
  totalSos!: number;
}

import { Field } from '@nestjs/graphql';

export class GetRentalInput {
  @Field(() => String)
  id!: string;
}

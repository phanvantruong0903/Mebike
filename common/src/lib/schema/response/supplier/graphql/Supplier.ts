import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Bike } from '../../bike';

@ObjectType()
export class ContactInfo {
  @Field()
  phone!: string;

  @Field()
  address!: string;
}

@ObjectType()
export class Supplier {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => ContactInfo)
  contactInfo!: ContactInfo;

  @Field()
  contactFee!: string;

  @Field(() => String)
  status!: string;

  @Field(() => [Bike])
  bikes!: Bike[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}

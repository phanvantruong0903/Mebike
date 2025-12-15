import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

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

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

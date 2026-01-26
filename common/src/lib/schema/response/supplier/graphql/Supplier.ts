import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Bike } from '../../bike';
import { Transform } from 'class-transformer';

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

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Transform(({ value }) => (value ? new Date(value) : null))
  updatedAt!: Date;

  @Field(() => Number, { nullable: true })
  totalBikes?: number;

  @Field(() => Number, { nullable: true })
  availableBikes?: number;

  @Field(() => Number, { nullable: true })
  bookedBikes?: number;

  @Field(() => Number, { nullable: true })
  reservedBikes?: number;

  @Field(() => Number, { nullable: true })
  maintainedBikes?: number;

  @Field(() => Number, { nullable: true })
  unavailableBikes?: number;
}

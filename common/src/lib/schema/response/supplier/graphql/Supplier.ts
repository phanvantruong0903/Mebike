import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Bike } from '../../bike';
import { IsoDateScalar } from '../../../../graphql/iso-date.scalar';

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

  @Field(() => IsoDateScalar)
  createdAt!: string;

  @Field(() => IsoDateScalar)
  updatedAt!: string;

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

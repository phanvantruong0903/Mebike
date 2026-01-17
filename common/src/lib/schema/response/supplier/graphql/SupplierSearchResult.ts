import { Field, ObjectType } from '@nestjs/graphql';
import { Bike } from '../../bike';
import { ContactInfo } from './Supplier';

@ObjectType()
export class SupplierSearchResult {
  @Field()
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
}

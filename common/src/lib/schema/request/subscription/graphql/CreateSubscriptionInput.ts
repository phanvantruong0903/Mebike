import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSubscriptionInput {
  @Field({ nullable: true })
  packageId?: string;

  @Field({ defaultValue: false, nullable: true })
  isActivated?: boolean;
}

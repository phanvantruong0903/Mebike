import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  packageId!: string;
}

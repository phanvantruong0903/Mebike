import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateSubscriptionInput {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  accountId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  packageId?: string;
}

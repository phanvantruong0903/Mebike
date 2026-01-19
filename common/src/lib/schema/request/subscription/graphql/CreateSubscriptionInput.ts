import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  packageId!: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isActivated?: boolean;
}

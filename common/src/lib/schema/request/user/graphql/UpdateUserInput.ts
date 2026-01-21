import { InputType, PartialType, OmitType, Field } from '@nestjs/graphql';
import { CreateUserInput } from './CreateUserInput';

@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email', 'role'] as const),
) {
  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  nfcCardUid?: string;
}

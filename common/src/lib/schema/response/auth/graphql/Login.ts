import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from '../../../request/user/graphql/CreateUserDto';

@InputType()
export class LoginInput extends PartialType(
  OmitType(CreateUserInput, ['YOB', 'name'] as const),
) {}

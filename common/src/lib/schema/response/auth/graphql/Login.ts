import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { RegisterUserInput } from '../../../request/user/graphql/RegisterUserInput';

@InputType()
export class LoginInput extends PartialType(
  OmitType(RegisterUserInput, ['YOB', 'name'] as const),
) {}

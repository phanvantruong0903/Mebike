import { OmitType, InputType } from '@nestjs/graphql';
import { CreateUserInput } from './CreateUserDto';

@InputType()
export class RegisterInput extends OmitType(CreateUserInput, [
  'role',
] as const) {}

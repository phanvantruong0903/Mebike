import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/CreateUserDto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

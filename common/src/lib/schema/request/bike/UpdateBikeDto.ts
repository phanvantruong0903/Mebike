import { PartialType } from '@nestjs/mapped-types';
import { CreateBikeDto } from './CreateBikeDto';

export class UpdateBikeDto extends PartialType(CreateBikeDto) {}

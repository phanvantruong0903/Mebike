import { IsString, IsNotEmpty } from 'class-validator';
import { DebitDto } from './DebitDto';

export class DebitRentalDto extends DebitDto {
  @IsString()
  @IsNotEmpty()
  rentalId!: string;
}

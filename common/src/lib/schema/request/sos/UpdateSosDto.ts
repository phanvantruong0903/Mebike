import { IsEnum, IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import { EmergencyStatus, Role } from '../../../prisma/index';

export class UpdateSosDto {
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsIn([
    EmergencyStatus.Unsolvable,
    EmergencyStatus.Cancelled,
    EmergencyStatus.Processing,
    EmergencyStatus.Resolved,
  ])
  status!: EmergencyStatus;

  @IsUUID()
  accountId!: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}

import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
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

  @IsString()
  @IsOptional()
  agentNotes?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @IsOptional()
  resolvedPhotos?: string[];
}

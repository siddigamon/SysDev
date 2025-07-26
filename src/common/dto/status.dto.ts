import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookStatus, LocationStatus } from '@prisma/client';

export class ChangeBookStatusDto {
  @IsEnum(BookStatus)
  status: BookStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ChangeLocationStatusDto {
  @IsEnum(LocationStatus)
  status: LocationStatus;
}

export interface StatusOperationDto {
  reason?: string;
}

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookStatus, LocationStatus } from '@prisma/client';

export class ChangeBookStatusDto {
  @IsEnum(BookStatus, {
    message:
      'Status must be a valid book status: AVAILABLE, CHECKED_OUT, LOST, DAMAGED, RETIRED, IN_REPAIR, or STORAGE',
  })
  status: BookStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ChangeLocationStatusDto {
  @IsEnum(LocationStatus, {
    message:
      'Status must be a valid location status: ACTIVE, INACTIVE, or ARCHIVED',
  })
  status: LocationStatus;
}

export interface StatusOperationDto {
  reason?: string;
}

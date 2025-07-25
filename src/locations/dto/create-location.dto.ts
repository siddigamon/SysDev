import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsString()
  @IsOptional()
  section?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

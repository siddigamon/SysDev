import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  authorId: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  genreIds?: number[];

  @IsInt()
  @IsOptional()
  locationId?: number;

  @IsDateString()
  publishedAt: string;

  @IsDateString()
  @IsOptional()
  reprintDate?: string;

  @IsString()
  @IsOptional()
  edition?: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @IsOptional()
  pageCount?: number;
}

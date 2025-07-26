import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateBookDto {
  @IsString({ message: 'Book title must be a valid text string' })
  @IsNotEmpty({ message: 'Every book needs a title - please provide one' })
  title: string;

  @IsInt({
    message: 'Author ID must be a valid number representing an existing author',
  })
  authorId: number;

  @IsArray({ message: 'Genre IDs should be provided as an array of numbers' })
  @IsInt({ each: true, message: 'Each genre ID must be a valid number' })
  @IsOptional()
  genreIds?: number[];

  @IsInt({ message: 'Location ID must refer to a valid library location' })
  @IsOptional()
  locationId?: number;

  @IsDateString(
    {},
    { message: 'Publication date must be in valid date format (YYYY-MM-DD)' },
  )
  publishedAt: string;

  @IsDateString(
    {},
    { message: 'Reprint date must be in valid date format (YYYY-MM-DD)' },
  )
  @IsOptional()
  reprintDate?: string;

  @IsString({
    message:
      'Edition information should be descriptive text (e.g., "1st Edition", "Revised")',
  })
  @IsOptional()
  edition?: string;

  @IsString({ message: 'Publisher name must be valid text' })
  @IsOptional()
  publisher?: string;

  @IsString({
    message: 'ISBN should be a valid text string (ISBN-10 or ISBN-13 format)',
  })
  @IsOptional()
  isbn?: string;

  @IsInt({ message: 'Page count must be a positive whole number' })
  @IsOptional()
  pageCount?: number;
}

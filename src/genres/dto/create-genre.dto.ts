import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateGenreDto {
  @IsString({ message: 'Genre name must be a text value' })
  @IsNotEmpty({
    message: 'Please provide a genre name (e.g., "Science Fiction", "Romance")',
  })
  name: string;

  @IsString({ message: 'Genre description must be text' })
  @IsOptional()
  description?: string;
}

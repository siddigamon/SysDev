import { IsNotEmpty, IsString, IsInt, IsDateString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  authorId: number;

  @IsDateString()
  publishedAt: string;
}

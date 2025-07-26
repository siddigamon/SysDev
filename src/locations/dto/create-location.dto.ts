import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLocationDto {
  @IsString({ message: 'Location name must be a text value' })
  @IsNotEmpty({
    message: 'Every location needs a name - what should we call this spot?',
  })
  name: string;

  @IsInt({
    message: 'Floor number must be a whole number.',
  })
  @Min(0, {
    message: 'Floor must be 0 or higher (basement = 0, ground = 1, etc.)',
  })
  @IsOptional()
  floor?: number;

  @IsString({
    message: 'Section identifier should be text (like "A", "SF", "REF")',
  })
  @IsOptional()
  section?: string;

  @IsString({
    message: 'Description must be text explaining what goes in this location',
  })
  @IsOptional()
  description?: string;
}

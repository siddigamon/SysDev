import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAuthorDto {
  @IsString({ message: 'First name must be a text value' })
  @IsNotEmpty({
    message: 'First name is required - every author needs a first name',
  })
  firstName: string;

  @IsString({ message: 'Middle name must be a text value' })
  @IsOptional()
  middleName?: string;

  @IsString({ message: 'Last name must be a text value' })
  @IsNotEmpty({
    message: "Last name is required - we need to know the author's surname",
  })
  lastName: string;
}

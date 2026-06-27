import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchSymptomDto {
  @IsNotEmpty({ message: 'The search field cannot be left blank.' })
  @IsString({ message: 'The search query must be a string of text.' })
  @Length(5, 500, { message: 'The description of the symptom you are looking for must be between 5 and 500 characters.' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  query!: string;
}
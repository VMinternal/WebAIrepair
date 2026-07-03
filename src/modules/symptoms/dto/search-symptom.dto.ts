import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchSymptomDto {
 @IsNotEmpty({ message: 'The search field cannot be left blank.' })
  @IsString({ message: 'The search query must be a string of text.' })
  @Length(5, 500, { message: 'The description of the symptom you are looking for must be between 5 and 500 characters.' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  query!: string;

  // Add a deviceId field (UUID format) for dynamic filtering by device model.
  @IsOptional()
  @IsUUID('4', { message: 'The device ID must be in valid UUID format.' })
  deviceId?: string;

  // Add a warrantyPeriod field to dynamically filter by warranty period.
  @IsOptional()
  @IsString({ message: 'The warranty period must be a string.' })
  warrantyPeriod?: string;
}
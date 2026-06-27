import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSymptomDto {
 @IsNotEmpty({ message: 'The symptom name cannot be left blank.' })
  @IsString({ message: 'The symptom name must be a string of text.' })
  @Length(10, 500, { message: 'Symptom descriptions must be between 10 and 500 characters long for accurate AI recognition.' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value) // Remove extra spaces
  name!: string;

  @IsNotEmpty({ message: 'The device ID must not be left blank.' })
  @IsUUID('4', { message: 'The device ID must be in valid UUID format.' })
  deviceId!: string;
}

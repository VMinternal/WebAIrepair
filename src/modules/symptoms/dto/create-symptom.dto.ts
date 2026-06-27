import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSymptomDto {
  @IsString({ message: 'The symptom name must be a string of text.' })
  @IsNotEmpty({ message: 'The symptom name cannot be left blank.' })
  name: string; // The text will be sent to the AI ​​to be encoded into a vector.

  @IsUUID('4', { message: 'The device ID must be in valid UUID format.' })
  @IsNotEmpty({ message: 'The device ID must not be left blank.' })
  deviceId: string; // Use the ID of the faulty device to establish a binding relationship.
}

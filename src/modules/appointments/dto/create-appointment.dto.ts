import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  deviceModel: string;

  @IsUUID()
  @IsOptional()
  deviceId?: string;

  @IsUUID()
  @IsOptional()
  issueId?: string; 

  @IsString()
  @IsOptional()
  issueDescription?: string; 

  @IsNumber()
  @IsOptional()
  totalPrice?: number; 

  @IsDateString()
  @IsOptional()
  appointmentDate?: string; 
}

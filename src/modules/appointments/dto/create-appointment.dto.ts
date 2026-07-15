import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsUUID()
  @IsOptional()
  deviceId?: string;

  @IsUUID()
  @IsOptional()
  issueId?: string; // Mã lỗi AI quét ra (nếu có)

  @IsString()
  @IsOptional()
  issueDescription?: string; // Triệu chứng/Mô tả khách nhập

  @IsNumber()
  @IsOptional()
  totalPrice?: number; // Tổng số tiền chốt từ AI và linh kiện

  @IsDateString()
  @IsOptional()
  appointmentDate?: string; // Ngày hẹn (ví dụ: "2026-07-15T14:30:00Z")
}

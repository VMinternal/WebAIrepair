import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string; 

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự!' })
  password: string; 

  @IsString()
  @IsNotEmpty({ message: 'Tên người dùng không được để trống!' })
  name: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'tech', 'user'], { message: 'Quyền hạn (role) chỉ có thể là admin hoặc tech!' })
  role?: string; 
}
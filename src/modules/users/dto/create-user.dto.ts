import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'The email is not in the correct format!' })
  @IsNotEmpty({ message: 'The email address cannot be left blank!' })
  email: string; 

  @IsString()
  @IsNotEmpty({ message: 'The password cannot be left blank!' })
  @MinLength(6, { message: 'The password must contain at least 6 characters!' })
  password: string; 

  @IsString()
  @IsNotEmpty({ message: 'The username cannot be blank!' })
  name: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'tech', 'user'], { message: 'The role can only be held by an admin or a tech expert!' })
  role?: string; 
}
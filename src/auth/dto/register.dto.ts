import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'The email is not in the correct format!' })
  @IsNotEmpty({ message: 'The email address cannot be left blank!' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'The password cannot be left blank!' })
  @MinLength(8, { message: 'Passwords must have at least 8 characters!' })
  // 72-character limit against Bcrypt DoS
  @MaxLength(72, { message: 'Passwords must be a maximum of 72 characters to protect against DoS attacks!' }) 
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Passwords must contain at least one uppercase letter, one lowercase letter, and one number or special character!',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'The full name cannot be left blank!' })
  @MaxLength(50, { message: 'Full name must not exceed 50 characters!' })
  fullName: string;

  
}
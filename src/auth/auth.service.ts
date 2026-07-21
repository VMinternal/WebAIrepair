import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service'; 
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Account authentication function from the actual database.
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email); 
    if (!user) {
      throw new UnauthorizedException('Incorrect username or password!');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect username or password!');
    }
    // Verification successful, password extraction to secure information before token creation.
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role // Role is retrieved directly from the 'role' column in the User table in the database.
    };
    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role
    };
  }

  async register(registerDto: RegisterDto) {
    const newUser = await this.usersService.create({
      name: registerDto.fullName,
      email: registerDto.email,
      password: registerDto.password,
    });

    return {
      message: 'Account registration successful!',
      user: newUser,
    };
  }
}
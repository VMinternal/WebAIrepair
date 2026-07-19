import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service'; 
import * as bcrypt from 'bcrypt';

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
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác!');
    }
    // 4. Xác thực thành công, bóc tách mật khẩu ra để bảo mật thông tin trước khi tạo Token
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role // Role lấy trực tiếp từ cột 'role' trong bảng User ở DB
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
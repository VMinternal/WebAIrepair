import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    // 🚀 GỌI DATA THẬT: Xác thực thông tin tài khoản từ PostgreSQL
    const user = await this.authService.validateUser(body.email, body.password);
    
    // Cấp mã Token chứa thông tin thật từ DB
    return this.authService.login(user);
  }
}
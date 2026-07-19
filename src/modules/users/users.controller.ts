import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * 🔒 LẤY DANH SÁCH USER (Chỉ Admin mới được phép)
   * 💡 Mẹo: Sau khi làm xong AuthModule, bạn sẽ thêm @UseGuards(JwtAuthGuard, RolesGuard) ở đây
   */
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

 
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

 
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto
  ): Promise<Omit<User, 'passwordHash'>> {
    return await this.usersService.update(id, updateUserDto);
  }

 
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.usersService.remove(id);
  }
}

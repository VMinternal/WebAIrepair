import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, 
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const { password, email, name } = createUserDto;

    // 1. Mã hóa mật khẩu với Salt Round = 10 (Chuẩn an toàn mã hóa)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Tạo đối tượng user mới với mật khẩu đã được bảo mật
    const newUser = this.userRepository.create({
      email: email.toLowerCase().trim(), // Chuẩn hóa email về chữ thường
      passwordHash: hashedPassword,
      fullname: name || (createUserDto as any).fullname,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      
      // 3. Giấu mật khẩu trước khi trả về Frontend để đảm bảo an toàn
      const { passwordHash: _, ...result } = savedUser;
      return result;
    } catch (error) {
      // Mã lỗi '23505' là lỗi Unique Violation (Trùng cột unique như Email) trong Postgres
      if ((error as any).code === '23505') {
        throw new ConflictException(`Email "${email}" đã tồn tại trên hệ thống!`);
      }
      throw new InternalServerErrorException('Lỗi hệ thống, không thể tạo tài khoản lúc này.');
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'email', 'fullname', 'role', 'createdAt'], 
    });
  }

 async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullname', 'role', 'createdAt'], 
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy thành viên có ID: ${id}`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      select: ['id', 'email', 'passwordHash', 'role'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Không tìm thấy thành viên để cập nhật.');

    const { password, ...rest } = updateUserDto;
    Object.assign(user, rest);
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await this.userRepository.save(user);
    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Không tìm thấy thành viên để xóa.');
    
    await this.userRepository.remove(user);
    return { message: 'Xóa thành viên thành công.' };
  }
}

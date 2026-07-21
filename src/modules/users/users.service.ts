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

    // Encrypt your password using Salt Round = 10 (a secure encryption standard).
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object with a secured password.
    const newUser = this.userRepository.create({
      email: email.toLowerCase().trim(), // Standardize emails to lowercase.
      passwordHash: hashedPassword,
      fullname: name || (createUserDto as any).fullname,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      
      // Hide the password before returning it to the frontend to ensure security.
      const { passwordHash: _, ...result } = savedUser;
      return result;
    } catch (error) {
      // Error code '23505' indicates a Unique Violation error (duplicate column, such as Email) in PostgreSQL.
      if ((error as any).code === '23505') {
        throw new ConflictException(`Email "${email}" It already exists on the system!`);
      }
      throw new InternalServerErrorException('System error, unable to create an account at this time.');
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
      throw new NotFoundException(`No member with ID found: ${id}`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      select: ['id', 'email', 'passwordHash', 'role','fullname', 'isActive'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('No members were found to update.');

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
    if (!user) throw new NotFoundException('No member found to delete.');
    
    await this.userRepository.remove(user);
    return { message: 'Member removal successful.' };
  }
}

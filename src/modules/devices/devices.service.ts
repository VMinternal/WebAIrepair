import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Import để nhúng DB
import { Repository } from 'typeorm';                // Import class Repository mẫu
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';

@Injectable()
export class DevicesService {
  
  // Create a constructor to connect to the devices table under pgAdmin.
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  create(createDeviceDto: CreateDeviceDto) {
    return 'This action adds a new device';
  }

  // Make the findAll function async and call the command to retrieve all data.
  async findAll(): Promise<Device[]> {
  return await this.deviceRepository.find({
    relations: ['parts'] 
  });
}

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return `This action updates a #${id} device`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
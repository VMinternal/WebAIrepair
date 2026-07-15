import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { DataSource } from 'typeorm';
import { Device } from '../devices/entities/device.entity';
import { Issue } from '../issues/entities/issue.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private dataSource: DataSource,
  ) {}
  
 async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const newAppointment = this.appointmentRepository.create({
      customerName: createAppointmentDto.customerName,
      phone: createAppointmentDto.phone,
      
      deviceId: createAppointmentDto.deviceId,
      issueId: createAppointmentDto.issueId,
      issueDescription: createAppointmentDto.issueDescription,
      totalPrice: createAppointmentDto.totalPrice || 0,
      appointmentDate: createAppointmentDto.appointmentDate ? new Date(createAppointmentDto.appointmentDate) : undefined,
      status: 'pending', // Newly created orders are always set to pending approval by default.
    });
    try {
      return await this.appointmentRepository.save(newAppointment);
    } catch (error) {
      console.error('Error creating a detailed appointment:', error);
      if ((error as any).code === '23503') {
        throw new BadRequestException('The device or AI error code transmitted does not exist in the system.');
      }
        throw new BadRequestException('The system is busy and cannot process booking orders at this time. Please try again later.');
    }
  }

  async findAll(): Promise<Appointment[]> {
      return await this.appointmentRepository.find({
        relations: ['device', 'issue', 'technician'], 
        order: { createdAt: 'DESC' }, 
      });
    }

    async findOne(id: string): Promise<Appointment> {
     if (!isUUID(id)) {
      throw new BadRequestException(`ID code '${id}' Invalid. The record must be a standard UUID string.`);
    }
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['device', 'issue', 'technician'],
    });
    if (!appointment) {
      throw new NotFoundException(`No appointments were found matching this ID code: ${id}`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
  const appointment = await this.findOne(id);
  const { deviceId, issueId, appointmentDate, ...remainingData } = updateAppointmentDto;
  if (deviceId) {
    const deviceExists = await this.dataSource.getRepository(Device).findOneBy({ id: deviceId });
    if (!deviceExists) {
      throw new BadRequestException(`Device ID: '${deviceId}' It does not exist on the system.`);
    }
    appointment.device = deviceExists; 
  }
  if (issueId) {
    const issueExists = await this.dataSource.getRepository(Issue).findOneBy({ id: issueId });
    if (!issueExists) {
      throw new BadRequestException(`AI error code (issueId) '${issueId}' It does not exist on the system.`);
    }
    appointment.issue = issueExists; 
  }
  if (appointmentDate) {
    appointment.appointmentDate = new Date(appointmentDate);
  }
  this.appointmentRepository.merge(appointment, remainingData);
  await this.appointmentRepository.save(appointment);

  return this.findOne(id);
}

  async remove(id: string): Promise<{ message: string }> {
    // Check if that appointment exists so you can delete it; otherwise, it will automatically throw a 404 error.
    const appointment = await this.findOne(id);
    
    await this.appointmentRepository.remove(appointment);
    return { message: `Appointment with ID code successfully deleted: ${id}` };
  }
}

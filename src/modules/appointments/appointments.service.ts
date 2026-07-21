import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { ILike, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { DataSource } from 'typeorm';
import { Device } from '../devices/entities/device.entity';
import { Issue } from '../issues/entities/issue.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,

    private dataSource: DataSource,
  ) {}
  
  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    console.log('=== DTO DATA RECEIVED ===', createAppointmentDto);
  //Get the device model name sent from the frontend (e.g., "iphone 14 pro max")
  const modelName = createAppointmentDto.deviceModel;
  let foundDevice: Device | null = null;

  if (modelName) {
    try {
      // Find the device in the database with a matching model (case-insensitive).
      foundDevice = await this.deviceRepository.findOne({
        where: { model: ILike(`%${modelName.trim()}%`) } 
      });
      console.log('=== DEVICE SEARCH RESULTS IN THE DATABASE ===', foundDevice);
      // Place a log entry here to check if the machine is actually found in the database.
      console.log('--> Device search results:', foundDevice);
      
    } catch (dbError) {
      console.error('No matching device found under DB:', dbError);
      
    }
  }else {
    // LOG IN IF MACHINE NAME IS EMPTY
    console.log('⚠️ WARNING: The deviceModel sent is empty or undefined!');
  }
  // Encapsulate data according to the Entity attribute.
  const newAppointment = this.appointmentRepository.create({
    customerName: createAppointmentDto.customerName,
    phone: createAppointmentDto.phone,
    
  
    // Assign the 'foundDevice' entity directly to the 'device' property (ManyToOne relationship).
    //If not found by modelName, try fallingback to the object containing deviceId from the DTO.
    device: foundDevice ? foundDevice : (createAppointmentDto.deviceId ? { id: createAppointmentDto.deviceId } : undefined), 
    
    issueId: createAppointmentDto.issueId,
    issueDescription: createAppointmentDto.issueDescription,
    totalPrice: createAppointmentDto.totalPrice || 0,
    
    // If the frontend doesn't send the date, it will automatically use the current system date and time.
    appointmentDate: createAppointmentDto.appointmentDate 
      ? new Date(createAppointmentDto.appointmentDate) 
      : new Date(),
      
    status: 'pending', 
  });

  // Proceed with saving to the database using a strong try-catch defense strategy.
  try {
    return await this.appointmentRepository.save(newAppointment);
  } catch (error) {
    console.error('Error creating a detailed appointment:', error);
    if ((error as any).code === '23503') {
      throw new BadRequestException('The device or error code that sent the AI ​​does not exist in the system.');
    }
    throw new BadRequestException('The system is busy and cannot process your booking at this time. Please try again later.');
  }
}

  async findAll(): Promise<Appointment[]> {
      return await this.appointmentRepository.find({
        relations: ['device', 'issue', 'technician'], 
        order: { createdAt: 'DESC' }, 
      });
    }

  async findByPhone(phone: string): Promise<Appointment[]> {
  const appointments = await this.appointmentRepository.find({
    where: { phone: phone },
    relations: ['device'],
    order: {
      createdAt: 'DESC', 
    },
  });
  if (!appointments || appointments.length === 0) {
    throw new NotFoundException(`No appointments were found for this phone number: ${phone}`);
  }

  return appointments;
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
  const appointment = await this.findOne(id);
  if (appointment.status === 'completed') {
    throw new BadRequestException(
      `Completed appointments cannot be deleted. (ID: ${id}). This data must be retained for financial reconciliation purposes.`
    );
  }
  if (appointment.status === 'accepted' || appointment.status === 'in_progress') {
    throw new BadRequestException(
      `The appointment is being processed by a technician. It cannot be canceled at this time.`
    );
  }
  await this.appointmentRepository.remove(appointment);
  return { message: `Appointment with ID code ${id} It has been successfully deleted from the system.` };
}
}

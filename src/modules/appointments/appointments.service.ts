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
    console.log('=== DỮ LIỆU DTO NHẬN ĐƯỢC ===', createAppointmentDto);
  // 1. Lấy tên model thiết bị từ Frontend gửi lên (ví dụ: "iphone 14 pro max")
  const modelName = createAppointmentDto.deviceModel;
  let foundDevice: Device | null = null;

  if (modelName) {
    try {
      // Tìm thiết bị trong DB có model trùng khớp (Không phân biệt hoa thường)
      foundDevice = await this.deviceRepository.findOne({
        where: { model: ILike(`%${modelName.trim()}%`) } 
      });
      console.log('=== KẾT QUẢ TÌM THIẾT BỊ TRONG DB ===', foundDevice);
      // Đặt một dòng log ở đây để kiểm tra xem có tìm thấy máy trong DB thật không
      console.log('--> Kết quả tìm kiếm thiết bị:', foundDevice);
      
    } catch (dbError) {
      console.error('Không tìm thấy thiết bị phù hợp dưới DB:', dbError);
      
    }
  }else {
    // 🔴 3. LOG NẾU BIẾN TÊN MÁY BỊ TRỐNG
    console.log('⚠️ CẢNH BÁO: deviceModel gửi lên bị rỗng hoặc undefined!');
  }
  // 2. Đóng gói dữ liệu chuẩn theo thuộc tính Entity của bạn
  const newAppointment = this.appointmentRepository.create({
    customerName: createAppointmentDto.customerName,
    phone: createAppointmentDto.phone,
    
    // ✨ THAY ĐỔI QUAN TRỌNG Ở ĐÂY:
    // Gán trực tiếp thực thể 'foundDevice' vào thuộc tính 'device' (quan hệ ManyToOne)
    // Nếu không tìm thấy bằng tên modelName, thử fallback về đối tượng chứa deviceId từ DTO
    device: foundDevice ? foundDevice : (createAppointmentDto.deviceId ? { id: createAppointmentDto.deviceId } : undefined), 
    
    issueId: createAppointmentDto.issueId,
    issueDescription: createAppointmentDto.issueDescription,
    totalPrice: createAppointmentDto.totalPrice || 0,
    
    // Nếu Frontend không gửi ngày lên, tự động lấy ngày giờ hiện tại của hệ thống
    appointmentDate: createAppointmentDto.appointmentDate 
      ? new Date(createAppointmentDto.appointmentDate) 
      : new Date(),
      
    status: 'pending', 
  });

  // 3. Tiến hành lưu xuống Database với try-catch phòng thủ chặt chẽ
  try {
    return await this.appointmentRepository.save(newAppointment);
  } catch (error) {
    console.error('Error creating a detailed appointment:', error);
    if ((error as any).code === '23503') {
      throw new BadRequestException('Mã thiết bị hoặc mã lỗi AI gửi lên không tồn tại trong hệ thống.');
    }
    throw new BadRequestException('Hệ thống bận, không thể xử lý đặt lịch lúc này. Vui lòng thử lại sau.');
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
    throw new NotFoundException(`Không tìm thấy lịch hẹn nào cho số điện thoại: ${phone}`);
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

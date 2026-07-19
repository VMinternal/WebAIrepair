import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from 'src/modules/devices/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Issue } from 'src/modules/issues/entities/issue.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 255 })
  customerName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  deviceId: string;

  @Column({ name: 'issue_id', type: 'uuid', nullable: true })
  issueId: string;

  @Column({ name: 'issue_description', type: 'text', nullable: true })
  issueDescription: string;

  @Column({ name: 'total_price', type: 'integer', default: 0 })
  totalPrice: number;

  @Column({ name: 'appointment_date', type: 'timestamp without time zone', nullable: true })
  appointmentDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ name: 'technician_id', type: 'uuid', nullable: true })
  technicianId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Device, (device) => device.appointments)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'technician_id' })
  technician: User;

  @ManyToOne(() => Issue)
  @JoinColumn({ name: 'issue_id' })
  issue: Issue;
}

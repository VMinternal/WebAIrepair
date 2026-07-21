import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Device } from 'src/modules/devices/entities/device.entity';
import { Issue } from 'src/modules/issues/entities/issue.entity';
@Entity('parts')
export class Part {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  
  @Column({ type: 'varchar', length: 200 })
  name: string;

 
  @Column({ type: 'varchar', length: 200, nullable: true })
  slug: string;

 
  @Column({ type: 'text', nullable: true })
  description: string;

 
  @Column({ type: 'integer', default: 0, nullable: true })
  price: number;

 
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string;

  
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

 
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

 
  @Column({ type: 'varchar', length: 50, name: 'warranty_period', nullable: true })
  warrantyPeriod: string;

  @ManyToMany(() => Device, (device) => device.parts)
  @JoinTable({
    name: 'part_devices', 
    joinColumn: { name: 'part_id', referencedColumnName: 'id' },       
    inverseJoinColumn: { name: 'device_id', referencedColumnName: 'id' } 
  })
  devices!: Device[];

  @ManyToMany(() => Issue, (issue) => issue.parts)
  issues: Issue[];
}
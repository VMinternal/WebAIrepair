import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Symptom } from 'src/modules/symptoms/entities/symptom.entity';
import { Device } from 'src/modules/devices/entities/device.entity';
import { Part } from 'src/modules/parts/part.entity';

@Entity({name: 'issues'})
export class Issue {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', length: 200})
    title: string;

    @Column({type: 'varchar', length: 200, nullable: true})
    slug: string;

    @Column({type: 'text', nullable: true})
    description: string;

    @Column({type: 'text', nullable: true})
    causes: string;

    @Column({type: 'text', nullable: true})
    solutions: string;

    @Column ({type: 'uuid', name: 'created_by', nullable: true})
    createdBy:string;

    @Column({ type: 'uuid', name: 'device_id', nullable: true }) 
    deviceId: string;

    @Column({
     type: 'vector' ,
      dimension: 768, // Số chiều 768 chuẩn của mô hình E5 chạy local bạn đã chọn
      nullable: true,
    } as any) 
      embedding: number[];
    
    @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      updatedAt: Date;

    @OneToMany(() => Symptom, (symptom) => symptom.issue)
    symptoms!: Symptom[];
    
    @ManyToOne(() => Device, (device) => device.issues, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'device_id' })
    device: Device;

    @ManyToMany(() => Part, (part) => part.issues)
    @JoinTable({
    name: 'issue_parts', // Tên bảng trung gian sẽ tự tạo trong DB
    joinColumn: { name: 'issue_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'part_id', referencedColumnName: 'id' }
    })
    parts: Part[];
}   

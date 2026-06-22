import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Symptom } from './symptom.entity';

@Entity('vectors')
export class Vector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'symptom_id', type: 'uuid' })
  symptom_id: string;

  
  @Column({ type: 'double precision', array: true, nullable: true })
  embedding: number[];


  @ManyToOne(() => Symptom, (symptom) => symptom.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'symptom_id' })
  symptom: Symptom;
}
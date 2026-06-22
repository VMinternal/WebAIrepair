import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Issue } from 'src/modules/issues/entities/issue.entity';
import { Vector } from './vector.entity';

@Entity('symptoms')
export class Symptom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'issue_id' })
  issueId: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Issue, (issue) => issue.symptoms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' }) 
  issue: Issue;

  @OneToMany(() => Vector, (vector) => vector.symptom)
  vectors: Vector[];
}
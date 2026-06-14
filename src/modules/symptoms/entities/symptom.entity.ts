import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Issue } from 'src/modules/issues/entities/issue.entity';

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
  issue!: Issue;
}
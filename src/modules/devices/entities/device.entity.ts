import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Part } from "src/modules/parts/part.entity";
import { Issue } from 'src/modules/issues/entities/issue.entity';

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', length: 100})
    brand: string;

    @Column({type: 'varchar', length: 100})
    model: string;

    @ManyToMany(() => Part, (part) => part.devices)
    parts!: Part[];

    @OneToMany(() => Issue, (issue) => issue.device)
    issues: Issue[];
}
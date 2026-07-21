import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from './entities/part.entity';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>, // TypeORM activation repository
  ) {}

 

  // This function retrieves the complete list of components currently available under pgAdmin.
 async getAllParts(): Promise<Part[]> {
  return await this.partRepository.find({
    relations: ['devices']
  });
}
}
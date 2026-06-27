import { BadGatewayException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';
import { Symptom } from './entities/symptom.entity';
import { AiService } from '../ai/ai.service';
import { Vector } from './entities/vector.entity';
import { Issue } from '../issues/entities/issue.entity';

@Injectable()
export class SymptomsService {
  constructor(
    @InjectRepository(Symptom)
    private readonly symptomRepository: Repository<Symptom>,
    @InjectRepository(Vector)
    private readonly vectorRepository: Repository<Vector>,

    private readonly aiService: AiService,
    private readonly dataSource: DataSource,
  ){}

async createAdvancedSymptom(dto: CreateSymptomDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    if (!dto.deviceId) {
    throw new BadGatewayException('The deviceId is required and cannot be left blank!');
    }
    //  Find the current problem with this device in the database first, based on the device ID from the DTO.
    const matchedIssue = await queryRunner.manager.findOne(Issue, { 
      where: { device: { id: dto.deviceId } } 
    });

    // If no problem is found, cancel the transaction and report the error to the client immediately.
    if (!matchedIssue) {
      throw new NotFoundException(
        `No issues were found associated with device ID: ${dto.deviceId}`
      );
    }

    // STATION 1: Record symptom information
    const newSymptom = queryRunner.manager.create(Symptom, {
      content: dto.name,
      issue: { id: matchedIssue.id } as any, 
    });
    
    const savedSymptom = await queryRunner.manager.save(Symptom, newSymptom);

    // STATION 2: Call Local AI to break down text into a vector array of real numbers.
    const embeddingVector = await this.aiService.generateEmbedding(dto.name);

    if (!embeddingVector || !Array.isArray(embeddingVector)) {
      throw new InternalServerErrorException('The AI ​​model does not return a valid vector format.');
    }

    // STATION 3: Save the newly obtained vector array to the vectors table.
    const newVector = queryRunner.manager.create(Vector, {
      embedding: embeddingVector,
      symptom: savedSymptom,
    });

    await queryRunner.manager.save(Vector, newVector);

    // DEAL FINALIZED: Once everything is successful, commit.
    await queryRunner.commitTransaction();

    return {
      message: 'Successful symptom generation and AI-assisted vectorization!',
      data: savedSymptom,
    };

  } catch (error) {
    // Cancel everything if any of the above errors occur.
    await queryRunner.rollbackTransaction();
    console.error('❌ Transaction error in SymptomsService:', error);
    if (error instanceof HttpException) {
      throw error;
    }

    throw new BadGatewayException(
      error instanceof Error ? error.message : 'An error occurred during symptom generation. The system has rolled back the data cleanly.'
    );
  } finally {
    // Unleash the connection
    await queryRunner.release();
  } 
}

  
  async getAllSymptoms(): Promise<Symptom[]> {
  return await this.symptomRepository.find({
    relations: ['issue'], 
    });
  }
  
  create(createSymptomDto: CreateSymptomDto) {
    return 'This action adds a new symptom';
  }

  findAll() {
    return `This action returns all symptoms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} symptom`;
  }

  update(id: number, updateSymptomDto: UpdateSymptomDto) {
    return `This action updates a #${id} symptom`;
  }

  remove(id: number) {
    return `This action removes a #${id} symptom`;
  }
}

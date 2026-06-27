import { BadGatewayException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';
import { SearchSymptomDto } from './dto/search-symptom.dto';
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

      // Check if this symptom has ever been reported for this Incident.
    const isDuplicate = await queryRunner.manager.findOne(Symptom, {
      where: {
        content: dto.name,
        issue: { id: matchedIssue.id }
      }
    });

    if (isDuplicate) {
      throw new ConflictException('This symptom has existed in the system due to a malfunction of this device.');
    }

    // STATION 1: Record symptom information
    const newSymptom = queryRunner.manager.create(Symptom, {
      content: dto.name,
      issue: { id: matchedIssue.id } as any, 
    });
    
    const savedSymptom = await queryRunner.manager.save(Symptom, newSymptom);

    // STATION 2: Call Local AI to break down text into a vector array of real numbers.
    const embeddingVector = await this.aiService.generateEmbedding(`passage: ${dto.name}`);

    const EXPECTED_DIMENSION = 768;

    if (!embeddingVector || !Array.isArray(embeddingVector)) {
      throw new InternalServerErrorException('The AI ​​model does not return a valid vector format.');
    }

    if (embeddingVector.length !== EXPECTED_DIMENSION) {
    throw new InternalServerErrorException(
      `Vector size error: The model returns ${embeddingVector.length} dimensions, but the system requires the correct ${EXPECTED_DIMENSION} dimensions.`
      );
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

  async searchSimilar(dto: SearchSymptomDto) {
  // Fix variable declaration errors and catch AI service errors.
  let searchVector: number[];
  
  try {
    // AI converts search queries into vectors.
    searchVector = await this.aiService.generateEmbedding(`query: ${dto.query}`); 
  } catch (aiError) {
    console.error('❌ AI Embedding Service Failure:', aiError);
    throw new InternalServerErrorException('The AI service is unavailable or failed to vectorize the search query.');
  }

  // Blocking Dimension Mismatch Errors
  const EXPECTED_DIMENSION = 768; 
  if (!searchVector || !Array.isArray(searchVector) || searchVector.length !== EXPECTED_DIMENSION) {
    throw new InternalServerErrorException(
      `Dimension mismatch: AI returned ${searchVector?.length || 0} dimensions, but DB requires ${EXPECTED_DIMENSION}.`
    );
  }

  // Convert the array of real numbers to a string so that PostgreSQL can understand the vector structure.
  const vectorString = `[${searchVector.join(',')}]`;

  //  Scan the database with threshold filters.
  let dbResults: any[];
  const SIMILARITY_THRESHOLD = 0.86; 

  try {
    // The calculation 1 - (distance) will convert to a similarity score of % (the closer to 1, the more identical).
    dbResults = await this.dataSource.query(
        `
      SELECT 
        s.id AS "symptomId", 
        s.content AS "symptomContent", 
        i.id AS "issueId",
        1 - (v.embedding <=> $1::vector) AS "similarityScore"  
      FROM vectors v
      INNER JOIN symptoms s ON v.symptom_id = s.id
      INNER JOIN issues i ON s.issue_id = i.id
      WHERE 1 - (v.embedding <=> $1::vector) >= $2            
      ORDER BY v.embedding <=> $1::vector ASC
      LIMIT 5
      `,
      [vectorString, SIMILARITY_THRESHOLD]
    );
  } catch (dbError) {
    console.error('❌ Database Raw Query Failure:', dbError);
    if (dbError instanceof Error && dbError.message.includes('vector symbols must have the same length')) {
      throw new InternalServerErrorException('System configuration error: Query vector dimension mismatch at the database layer.');
    }
    throw new InternalServerErrorException('An error occurred during the database scan.');
  }

  // Process the returned results and rank the level of confidence.
  if (!dbResults || dbResults.length === 0) {
    return {
      message: 'No matching symptoms or issues found for your description.',
      confidence: 'NONE',
      count: 0,
      data: [],
    };
  }

  const highestScore = dbResults[0].similarityScore;
  let confidence = 'LOW';
  if (highestScore >= 0.8) {
    confidence = 'HIGH';
  } else if (highestScore >= 0.6) {
    confidence = 'MEDIUM';
  }

  return {
    message: 'Matching symptoms found successfully!',
    confidence,
    count: dbResults.length,
    data: dbResults,
  };
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

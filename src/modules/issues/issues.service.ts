import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { Issue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AiService } from '../ai/ai.service';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issuesRepository: Repository<Issue>, 
    private readonly aiService: AiService,
  ) {}

  async create(createIssueDto: CreateIssueDto) {
    const textToEmbed = `${createIssueDto.title} ${createIssueDto.description || ''}`;
    const vector = await this.aiService.generateEmbedding(textToEmbed, true);
    const newIssue = this.issuesRepository.create({
      ...createIssueDto,
      embedding: vector,
    });
    return await this.issuesRepository.save(newIssue);
  }

  async searchAi(queryText: string) {
    const vector = await this.aiService.generateEmbedding(queryText, true);
    const vectorString = `[${vector.join(',')}]`;

    const results = await this.issuesRepository.query(
      `SELECT *, (embedding <=> $1::vector) as distance 
       FROM issues 
       WHERE embedding IS NOT NULL
       ORDER BY distance ASC 
       LIMIT 5`,
      [vectorString]
    );
    return results;
  }

  findAll() {
    return `This action returns all issues`;
  }

  async findOne(id: string) {
    return await this.issuesRepository.findOne({
      where: { id },
      relations: ['device', 'parts'],
    });
  }

  update(id: string, updateIssueDto: any) {
    return `This action updates a #${id} issue`;
  }

  remove(id: string) {
    return `This action removes a #${id} issue`;
  }
}

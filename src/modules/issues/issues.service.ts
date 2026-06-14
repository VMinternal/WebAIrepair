import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { Issue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issuesRepository: Repository<Issue>, 
  ) {}

  create(createIssueDto: CreateIssueDto) {
    return 'This action adds a new issue';
  }

  findAll() {
    return `This action returns all issues`;
  }

 async findOne(id: string) {
  return await this.issuesRepository.findOne({
    where: { id },
    relations: ['device', 'parts'], // 👈 Kéo Xuyên bảng: Lấy luôn thông tin thiết bị và các linh kiện liên quan
  });
}

  update(id: string, updateIssueDto: UpdateIssueDto) {
    return `This action updates a #${id} issue`;
  }

  remove(id: string) {
    return `This action removes a #${id} issue`;
  }
}

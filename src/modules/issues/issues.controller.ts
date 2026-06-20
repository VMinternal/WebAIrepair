import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { AiModule } from '../ai/ai.module';
import { AiService } from '../ai/ai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { Repository } from 'typeorm';

@Controller('issues')
export class IssuesController {
  constructor(
    private readonly issuesService: IssuesService) {}

  @Post()
  create(@Body() createIssueDto: CreateIssueDto) {
    return this.issuesService.create(createIssueDto);
  }

  @Get()
  findAll() {
    return this.issuesService.findAll();
  }

    @Get('search-ai')
  async searchAi(@Query('query') query: string) {
    return this.issuesService.searchAi(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIssueDto: UpdateIssueDto) {
    return this.issuesService.update(id, updateIssueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issuesService.remove(id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { Issue } from './entities/issue.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    AiModule,
    TypeOrmModule.forFeature([Issue]), 
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}

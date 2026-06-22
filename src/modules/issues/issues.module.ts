import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { Issue } from './entities/issue.entity';
import { AiModule } from '../ai/ai.module';
import { Device } from '../devices/entities/device.entity';

@Module({
  imports: [
    AiModule,
    TypeOrmModule.forFeature([Issue, Device]), 
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}

import { Module } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { SymptomsController } from './symptoms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Symptom } from './entities/symptom.entity';
import { Vector } from './entities/vector.entity';
import { AiModule } from '../ai/ai.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Symptom, Vector]),
    AiModule,
  ],
  controllers: [SymptomsController],
  providers: [SymptomsService],
})
export class SymptomsModule {}

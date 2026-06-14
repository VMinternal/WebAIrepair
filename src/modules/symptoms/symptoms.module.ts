import { Module } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { SymptomsController } from './symptoms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Symptom } from './entities/symptom.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Symptom])],
  controllers: [SymptomsController],
  providers: [SymptomsService],
})
export class SymptomsModule {}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';

@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  @Post('advanced')
  createAdvanced(@Body() createSymptomDto: CreateSymptomDto) {
    return this.symptomsService.createAdvancedSymptom(createSymptomDto);
  }

  @Get()
  getAllSymptoms() {
    return this.symptomsService.getAllSymptoms(); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.symptomsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSymptomDto: UpdateSymptomDto) {
    return this.symptomsService.update(+id, updateSymptomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.symptomsService.remove(+id);
  }
}

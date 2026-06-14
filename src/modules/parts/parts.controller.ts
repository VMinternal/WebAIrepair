import { Controller, Get } from '@nestjs/common';
import { PartsService } from './parts.service';

@Controller('parts') 
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get() // Define the GET method.
  async getParts() {
    const data = await this.partsService.getAllParts();
    return {
      success: true,
      message: 'The parts list was successfully retrieved!',
      data: data,
    };
  }
}
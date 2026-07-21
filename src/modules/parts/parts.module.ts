import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from './entities/part.entity';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';

@Module({
  // Register the 'parts' table in the system.
  imports: [TypeOrmModule.forFeature([Part])], 
  controllers: [PartsController],
  providers: [PartsService],
})
export class PartsModule {}
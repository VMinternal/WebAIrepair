import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService], // This line allows other modules to inherit from it.
})
export class AiModule {}
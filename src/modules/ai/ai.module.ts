import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService], // Dòng này cực kỳ quan trọng để các module khác kế thừa được
})
export class AiModule {}
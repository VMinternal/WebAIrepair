import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AiService implements OnModuleInit {
  private pipeline: any;

  async onModuleInit() {
    console.log('⏳ Loading the AI ​​Local model (multilingual-e5-base)...');
    
    // Dynamic import to avoid conflicts between NestJS's ESM and CommonJS.
    const { pipeline } = await import('@xenova/transformers');
    
    // Download the model from Hugging Face to your computer and run it completely locally.
    this.pipeline = await pipeline('feature-extraction', 'Xenova/multilingual-e5-base');
    
    console.log('✅ The AI ​​model has finished loading and is ready to run completely locally!');
  }

  // Function to convert text into a vector array of numbers (768 dimensions)
  async generateEmbedding(text: string, isQuery: boolean = false): Promise<number[]> {
    // Add the prefix query: or passage: in the E5 model.
    const prefix = isQuery ? 'query: ' : 'passage: ';
    const formattedText = `${prefix}${text}`;

    const output = await this.pipeline(formattedText, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data);
  }
}
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AiService implements OnModuleInit {
  private pipeline: any;

  async onModuleInit() {
    console.log('⏳ Đang khởi tải mô hình AI Local (multilingual-e5-base)...');
    
    // Import động để né xung đột giữa ESM và CommonJS của NestJS
    const { pipeline } = await import('@xenova/transformers');
    
    // Tải mô hình từ Hugging Face về máy chạy hoàn toàn Local
    this.pipeline = await pipeline('feature-extraction', 'Xenova/multilingual-e5-base');
    
    console.log('✅ Mô hình AI đã tải xong và sẵn sàng chạy hoàn toàn Local!');
  }

  // Hàm dịch chữ thành mảng số Vector (768 chiều)
  async generateEmbedding(text: string, isQuery: boolean = false): Promise<number[]> {
    // Thêm tiền tố query: hoặc passage: chuẩn mô hình E5
    const prefix = isQuery ? 'query: ' : 'passage: ';
    const formattedText = `${prefix}${text}`;

    const output = await this.pipeline(formattedText, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data);
  }
}
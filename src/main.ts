import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure global validation for the API.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  //Enable CORS here to allow Next.js (port 3000) to call it.
  app.enableCors({
    origin: 'http://localhost:8001', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow sending cookies/tokens if you plan to use them for authentication later.
  });

  await app.listen(8000); // Hoặc cổng hiện tại của bạn (ví dụ 8000)
}
bootstrap();

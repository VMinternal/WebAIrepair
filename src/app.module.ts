import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartsModule } from './modules/parts/parts.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SymptomsModule } from './modules/symptoms/symptoms.module';
import { IssuesModule } from './modules/issues/issues.module';


@Module({
  imports: [
    // 1. Kích hoạt ConfigModule để đọc file .env toàn cục
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    // 2. Kết nối tới PostgreSQL sử dụng các biến từ file .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // Automatically scan and load all files with the .entity.ts extension in the project.
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: true automatically creates tables in the database based on the Entity file.
        synchronize: true, 
      }),
    }),
    
    PartsModule,

    DevicesModule,

    SymptomsModule,

    IssuesModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartsModule } from './modules/parts/parts.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SymptomsModule } from './modules/symptoms/symptoms.module';
import { IssuesModule } from './modules/issues/issues.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { Issue } from './modules/issues/entities/issue.entity';
import { Device } from './modules/devices/entities/device.entity';
import { Part } from './modules/parts/part.entity';
import { Symptom } from './modules/symptoms/entities/symptom.entity';
import { User } from './modules/users/entities/user.entity';
import { Appointment } from './modules/appointments/entities/appointment.entity';
import { Post } from './modules/posts/entities/post.entity';
import { Tag } from './modules/posts/entities/tag.entity';
import { Vector } from './modules/symptoms/entities/vector.entity';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [
    // 1. Kích hoạt ConfigModule để đọc file .env toàn cục
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    // 2. Kết nối tới PostgreSQL sử dụng các biến từ file .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // Automatically scan and load all files with the .entity.ts extension in the project.
        entities: [Issue, Device, Part, Symptom, User, Appointment, Post, Tag, Vector],
        // synchronize: true automatically creates tables in the database based on the Entity file.
        synchronize: true, 
      }),
    }),
    
    PartsModule,

    DevicesModule,

    SymptomsModule,

    IssuesModule,

    UsersModule,

    AppointmentsModule,

    PostsModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
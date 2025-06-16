import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source'; // Import instance của DataSource

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSource.options, // Lấy options từ AppDataSource
    }),
  ],
})
export class DbModule {}

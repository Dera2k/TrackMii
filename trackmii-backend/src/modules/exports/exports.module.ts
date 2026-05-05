import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/expense.entity';
import { ExportController } from './exports.controller';
import { ExportsService } from './exports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [ExportController],
  providers: [ExportsService],
})
export class ExportsModule {}
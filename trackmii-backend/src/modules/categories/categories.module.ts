import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Expense } from '../expenses/expense.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Expense])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [TypeOrmModule, CategoriesService],
})
export class CategoriesModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { User } from '../users/user.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { BudgetsModule } from '../budgets/budgets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { ExpenseSeeder } from '../../database/seeders/expense.seeder'

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, User]),
    BudgetsModule,
    NotificationsModule,
    CategoriesModule,
    UsersModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpenseSeeder],
  exports: [TypeOrmModule, ExpensesService, ExpenseSeeder],
})
export class ExpensesModule {}
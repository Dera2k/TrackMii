import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { User } from '../users/user.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { BudgetsModule } from '../budgets/budgets.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, User]),
    BudgetsModule,
    NotificationsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [TypeOrmModule, ExpensesService],
})
export class ExpensesModule {}
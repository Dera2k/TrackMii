import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { Expense } from '../expenses/expense.entity';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, Expense]),
    NotificationsModule,
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [TypeOrmModule, BudgetsService],
})
export class BudgetsModule {}
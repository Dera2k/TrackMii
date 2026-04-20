import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [AuthModule, UsersModule, CategoriesModule, ExpensesModule, BudgetsModule, AnalyticsModule, NotificationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

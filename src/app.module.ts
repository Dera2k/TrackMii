import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExportsModule } from './modules/exports/exports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { getDatabaseConfig } from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './modules/auth/auth.service';
import { UsersService } from './modules/users/users.service';
import { NotificationsService } from './modules/notifications/notifications.service';
import { AnalyticsService } from './modules/analytics/analytics.service';
import { ExportsService } from './modules/exports/exports.service';
import { CategoriesService } from './modules/categories/categories.service';
import { ExpensesService } from './modules/expenses/expenses.service';
import { BudgetsService } from './modules/budgets/budgets.service';
@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, //1 minute
        limit: 100, //requests per minute
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    CategoriesModule,
    ExpensesModule,
    BudgetsModule,
    AnalyticsModule,
    NotificationsModule,
    ExportsModule,
  ],
  providers: [],
})
export class AppModule {}

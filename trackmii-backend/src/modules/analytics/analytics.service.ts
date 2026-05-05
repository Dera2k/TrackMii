import { DashboardStatsDto, TopCategoryDto } from "./dtos/dashboard-stats.dto";
import { MonthlyAnalyticsDto, MonthlyAnalyticsItemDto } from "./dtos/monthly-analytics.dto";
import { WeeklyAnalyticsDto, WeeklyAnalyticsItemDto } from "./dtos/weekly-analytics.dto";
import { CategoryBreakdownDto, CategoryBreakdownItemDto } from "./dtos/category-breakdown.dto";
import { Budget } from "../budgets/budget.entity";
import { Expense } from "../expenses/expense.entity";
import { Repository, IsNull } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AnalyticsService{
    constructor(
        @InjectRepository(Budget)
        private budgetRepo: Repository<Budget>,
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>
    ) {}

    async getDashboardStats(userId: string): Promise<DashboardStatsDto> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    //total spent all time
    const totalSpentResult = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .getRawOne();

    const total_spent_all_time = parseFloat(totalSpentResult?.total || '0');

    //current month spent
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);

    const currentMonthResult = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere(
        'expense.expense_date BETWEEN :start AND :end',
        {
          start: firstDayOfMonth.toISOString().split('T')[0],
          end: lastDayOfMonth.toISOString().split('T')[0],
        },
      )
      .getRawOne();

    const current_month_spent = parseFloat(currentMonthResult?.total || '0');

    //current month budget (overall budget where category_id is null)
    const overallBudget = await this.budgetRepo.findOne({
      where: {
        user_id: userId,
        category_id: IsNull(),
        month: currentMonth,
        year: currentYear,
      },
    });

    const current_month_budget = overallBudget
      ? parseFloat(overallBudget.amount.toString())
      : 0;

    const budget_usage_percentage =
      current_month_budget > 0
        ? (current_month_spent / current_month_budget) * 100
        : 0;

    //top category (highest spending)
    const topCategoryResult = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('category.name', 'name')
      .addSelect('category.color', 'color')
      .addSelect('SUM(expense.amount)', 'amount')
      .leftJoin('expense.category', 'category')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('expense.category_id IS NOT NULL')
      .groupBy('category.id')
      .orderBy('amount', 'DESC')
      .limit(1)
      .getRawOne();

    let top_category: TopCategoryDto | null = null;
    if (topCategoryResult) {
      top_category = {
        name: topCategoryResult.name,
        color: topCategoryResult.color,
        amount: parseFloat(topCategoryResult.amount),
      };
    }

    return {
      total_spent_all_time,
      current_month_spent,
      current_month_budget,
      budget_usage_percentage: parseFloat(budget_usage_percentage.toFixed(2)),
      top_category,
    };
  }

  async getMonthlyTrends(
    userId: string,
    months: number,
  ): Promise<MonthlyAnalyticsDto> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const results = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('YEAR(expense.expense_date)', 'year')
      .addSelect('MONTH(expense.expense_date)', 'month')
      .addSelect('SUM(expense.amount)', 'total_spent')
      .addSelect('expense.currency', 'currency')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('expense.expense_date >= :startDate', {
        startDate: startDate.toISOString().split('T')[0],
      })
      .groupBy('year, month, expense.currency')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();

    const data: MonthlyAnalyticsItemDto[] = results.map((r) => ({
      month: parseInt(r.month),
      year: parseInt(r.year),
      total_spent: parseFloat(r.total_spent),
      currency: r.currency,
    }));

    return { data };
  }

  async getWeeklyTrends(
    userId: string,
    weeks: number,
  ): Promise<WeeklyAnalyticsDto> {
    const now = new Date();
    const startDate = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

    const results = await this.expenseRepo
      .createQueryBuilder('expense')
      .select(
        'DATE_SUB(expense.expense_date, INTERVAL WEEKDAY(expense.expense_date) DAY)',
        'week_start',
      )
      .addSelect(
        'DATE_ADD(DATE_SUB(expense.expense_date, INTERVAL WEEKDAY(expense.expense_date) DAY), INTERVAL 6 DAY)',
        'week_end',
      )
      .addSelect('SUM(expense.amount)', 'total_spent')
      .addSelect('expense.currency', 'currency')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('expense.expense_date >= :startDate', {
        startDate: startDate.toISOString().split('T')[0],
      })
      .groupBy('week_start, week_end, expense.currency')
      .orderBy('week_start', 'ASC')
      .getRawMany();

    const data: WeeklyAnalyticsItemDto[] = results.map((r) => ({
      week_start_date: r.week_start,
      week_end_date: r.week_end,
      total_spent: parseFloat(r.total_spent),
      currency: r.currency,
    }));

    return { data };
  }

  async getCategoryBreakdown(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CategoryBreakdownDto> {
    const queryBuilder = this.expenseRepo
      .createQueryBuilder('expense')
      .select('category.id', 'category_id')
      .addSelect('category.name', 'category_name')
      .addSelect('category.color', 'color')
      .addSelect('SUM(expense.amount)', 'amount')
      .leftJoin('expense.category', 'category')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('expense.category_id IS NOT NULL');

    if (startDate && endDate) {
      queryBuilder.andWhere('expense.expense_date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }

    const results = await queryBuilder
      .groupBy('category.id')
      .orderBy('amount', 'DESC')
      .getRawMany();

    const totalSpent = results.reduce(
      (sum, r) => sum + parseFloat(r.amount),
      0,
    );

    const data: CategoryBreakdownItemDto[] = results.map((r) => {
      const amount = parseFloat(r.amount);
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;

      return {
        category_id: r.category_id,
        category_name: r.category_name,
        color: r.color,
        amount,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    return { data };
  }

}
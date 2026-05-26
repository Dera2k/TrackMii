import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Budget } from "./budget.entity";
import { Expense } from "../expenses/expense.entity";
import { CreateBudgetDto } from "./dtos/create-budget.dto";
import { UpdateBudgetDto } from "./dtos/update-budget.dto";
import { BudgetQueryDto } from "./dtos/budget-query.dto";
import { BudgetResponseDto } from "./dtos/budget-response.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../../common/enums/notification-type.enum";

@Injectable()
export class BudgetsService {
    constructor(
        @InjectRepository(Budget)
        private budgetRepo: Repository<Budget>,
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,
        private notificationsService: NotificationsService,
    ) {}

  async create(
    userId: string,
    dto: CreateBudgetDto,
  ): Promise<BudgetResponseDto> {
    this.validateNotPastMonth(dto.month, dto.year);

    const existing = await this.budgetRepo.findOne({
      where: {
        user_id: userId,
        category_id: dto.category_id || IsNull(),
        month: dto.month,
        year: dto.year,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Budget already exists for this category/month/year',
      );
    }

    const budget = this.budgetRepo.create({
      user_id: userId,
      category_id: dto.category_id,
      amount: dto.amount,
      currency: dto.currency,
      month: dto.month,
      year: dto.year,
    });

    await this.budgetRepo.save(budget);

    return this.toResponseDto(userId, budget);
  }

  async findAll(
    userId: string,
    query: BudgetQueryDto,
  ): Promise<BudgetResponseDto[]> {
    const whereClause: any = { user_id: userId };

    if (query.month !== undefined) {
      whereClause.month = query.month;
    }

    if (query.year !== undefined) {
      whereClause.year = query.year;
    }

    if (query.category_id !== undefined) {
      whereClause.category_id = query.category_id || IsNull();
    }

    const budgets = await this.budgetRepo.find({
      where: whereClause,
      relations: ['category'],
      order: { year: 'DESC', month: 'DESC' },
    });

    return Promise.all(budgets.map((b) => this.toResponseDto(userId, b)));
  }

  async findCurrentMonth(userId: string): Promise<BudgetResponseDto[]> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = await this.budgetRepo.find({
      where: {
        user_id: userId,
        month: currentMonth,
        year: currentYear,
      },
      relations: ['category'],
    });

    return Promise.all(budgets.map((b) => this.toResponseDto(userId, b)));
  }

  async findOne(userId: string, id: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetRepo.findOne({
      where: { id, user_id: userId },
      relations: ['category'],
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.toResponseDto(userId, budget);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateBudgetDto,
  ): Promise<BudgetResponseDto> {
    const budget = await this.budgetRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (dto.amount !== undefined) {
      budget.amount = dto.amount;
    }

    if (dto.currency !== undefined) {
      budget.currency = dto.currency;
    }

    await this.budgetRepo.save(budget);

    return this.toResponseDto(userId, budget);
  }

  async delete(userId: string, id: string): Promise<void> {
    const budget = await this.budgetRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    await this.budgetRepo.remove(budget);
  }

  async calculateSpentAmount(
    userId: string,
    categoryId: string | null,
    month: number,
    year: number,
  ): Promise<number> {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 1);
    lastDay.setDate(lastDay.getDate() - 1);

    const queryBuilder = this.expenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('expense.expense_date BETWEEN :start AND :end', {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
      });

    if (categoryId) {
      queryBuilder.andWhere('expense.category_id = :categoryId', { categoryId });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.total || '0');
  }

  async calculateUsagePercentage(
    spentAmount: number,
    budgetAmount: number,
  ): Promise<number> {
    if (budgetAmount === 0) return 0;
    return (spentAmount / budgetAmount) * 100;
  }

  async checkAndNotify(
    userId: string,
    categoryId: string | null,
    month: number,
    year: number,
  ): Promise<void> {
    const budget = await this.budgetRepo.findOne({
      where: {
        user_id: userId,
        category_id: categoryId || IsNull(),
        month,
        year,
      },
      relations: ['category'],
    });

    if (!budget) return;

    const spentAmount = await this.calculateSpentAmount(
      userId,
      categoryId,
      month,
      year,
    );
    const usagePercentage = await this.calculateUsagePercentage(
      spentAmount,
      parseFloat(budget.amount.toString()),
    );

    const categoryName = budget.category?.name || 'overall budget';

    if (usagePercentage >= 80 && usagePercentage < 100) {
      const isDuplicate = await this.notificationsService.checkDuplicate(
        userId,
        NotificationType.BUDGET_WARNING,
        categoryId,
        month,
        year,
      );

      if (!isDuplicate) {
        await this.notificationsService.create(
          userId,
          NotificationType.BUDGET_WARNING,
          'Budget Warning',
          `You've used ${usagePercentage.toFixed(0)}% of your ${categoryName} for ${month}/${year}`,
        );
      }
    }

    if (usagePercentage >= 100) {
      const isDuplicate = await this.notificationsService.checkDuplicate(
        userId,
        NotificationType.BUDGET_EXCEEDED,
        categoryId,
        month,
        year,
      );

      if (!isDuplicate) {
        await this.notificationsService.create(
          userId,
          NotificationType.BUDGET_EXCEEDED,
          'Budget Exceeded',
          `You've exceeded your ${categoryName} for ${month}/${year}`,
        );
      }
    }
  }

  private validateNotPastMonth(month: number, year: number): void {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      throw new BadRequestException('Cannot set budget for past month');
    }
  }

  private async toResponseDto(
    userId: string,
    budget: Budget,
  ): Promise<BudgetResponseDto> {
    const categoryId = budget.category_id ?? null;

    const spentAmount = await this.calculateSpentAmount(
      userId,
      categoryId,
      budget.month,
      budget.year,
    );

    const usagePercentage = await this.calculateUsagePercentage(
      spentAmount,
      parseFloat(budget.amount.toString()),
    );

    return {
      id: budget.id,
      amount: parseFloat(budget.amount.toString()),
      currency: budget.currency,
      month: budget.month,
      year: budget.year,
      spent_amount: spentAmount,
      usage_percentage: parseFloat(usagePercentage.toFixed(2)),
      category_id: categoryId,
      category: budget.category
        ? {
            id: budget.category.id,
            name: budget.category.name,
            color: budget.category.color,
          }
        : null,
      created_at: budget.created_at,
      updated_at: budget.updated_at,
    };
  }
}
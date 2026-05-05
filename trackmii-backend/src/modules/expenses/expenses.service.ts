import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from "typeorm";
import { Expense } from "./expense.entity";
import { CreateExpenseDto } from "./dtos/create-expense.dto";
import { UpdateExpenseDto } from "./dtos/update-expense.dto";
import { ExpenseQueryDto } from "./dtos/expense-query.dto";
import { BulkDeleteDto } from "./dtos/bulk-delete.dto";
import { ExpenseResponseDto } from "./dtos/expense-response.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { BudgetsService } from "../budgets/budgets.service";

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expenseRepo: Repository<Expense>,
        private notificationService: NotificationsService,
        private budgetsService: BudgetsService,
    ) {}

    async create(
    userId: string,
    dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const expense = this.expenseRepo.create({
      user_id: userId,
      title: dto.title,
      amount: dto.amount,
      currency: dto.currency,
      category_id: dto.category_id,
      payment_method: dto.payment_method,
      expense_date: dto.expense_date,
      note: dto.note,
    });

    await this.expenseRepo.save(expense);
//check budget thresholds after creating expense
    await this.checkBudgetThresholds(userId, expense);

    const created = await this.expenseRepo.findOne({
      where: { id: expense.id },
      relations: ['category'],
    });

    return this.toResponseDto(created!);
  }

  async findAllPaginated(userId: string, query: ExpenseQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false });

    // Filters
    if (query.category_id) {
      queryBuilder.andWhere('expense.category_id = :categoryId', {
        categoryId: query.category_id,
      });
    }

    if (query.payment_method) {
      queryBuilder.andWhere('expense.payment_method = :paymentMethod', {
        paymentMethod: query.payment_method,
      });
    }

    if (query.start_date && query.end_date) {
      queryBuilder.andWhere(
        'expense.expense_date BETWEEN :startDate AND :endDate',
        {
          startDate: query.start_date,
          endDate: query.end_date,
        },
      );
    }

    if (query.min_amount !== undefined) {
      queryBuilder.andWhere('expense.amount >= :minAmount', {
        minAmount: query.min_amount,
      });
    }

    if (query.max_amount !== undefined) {
      queryBuilder.andWhere('expense.amount <= :maxAmount', {
        maxAmount: query.max_amount,
      });
    }

    if (query.search) {
      queryBuilder.andWhere('expense.title LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // Sorting
    const sortBy = query.sort_by || 'date';
    const sortOrder = query.sort_order || 'DESC';
    const sortField = sortBy === 'date' ? 'expense.expense_date' : 'expense.amount';
    queryBuilder.orderBy(sortField, sortOrder);

    const [expenses, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = expenses.map((e) => this.toResponseDto(e));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<ExpenseResponseDto> {
    const expense = await this.expenseRepo.findOne({
      where: { id, user_id: userId, is_deleted: false },
      relations: ['category'],
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.toResponseDto(expense);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expenseRepo.findOne({
      where: { id, user_id: userId, is_deleted: false },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (dto.title !== undefined) expense.title = dto.title;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.currency !== undefined) expense.currency = dto.currency;
    if (dto.category_id !== undefined) expense.category_id = dto.category_id;
    if (dto.payment_method !== undefined) expense.payment_method = dto.payment_method;
    if (dto.expense_date !== undefined) expense.expense_date = dto.expense_date;
    if (dto.note !== undefined) expense.note = dto.note;

    await this.expenseRepo.save(expense);

    // Recheck budget thresholds after update
    await this.checkBudgetThresholds(userId, expense);

    const updated = await this.expenseRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    return this.toResponseDto(updated!);
  }

  async delete(userId: string, id: string): Promise<void> {
    const expense = await this.expenseRepo.findOne({
      where: { id, user_id: userId, is_deleted: false },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    expense.is_deleted = true;
    await this.expenseRepo.save(expense);
  }

  async bulkDelete(userId: string, dto: BulkDeleteDto): Promise<number> {
    const result = await this.expenseRepo.update(
      {
        id: In(dto.expense_ids),
        user_id: userId,
        is_deleted: false,
      },
      { is_deleted: true },
    );

    return result.affected || 0;
  }

  private async checkBudgetThresholds(
    userId: string,
    expense: Expense,
  ): Promise<void> {
    const expenseDate = new Date(expense.expense_date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    // Check category budget if expense has category
    if (expense.category_id) {
      await this.budgetsService.checkAndNotify(
        userId,
        expense.category_id,
        month,
        year,
      );
    }

    // Check overall monthly budget
    await this.budgetsService.checkAndNotify(userId, null, month, year);
  }

  toResponseDto(expense: Expense): ExpenseResponseDto {
    return {
      id: expense.id,
      title: expense.title,
      amount: parseFloat(expense.amount.toString()),
      currency: expense.currency,
      payment_method: expense.payment_method,
      expense_date: expense.expense_date,
      category: expense.category
        ? {
            id: expense.category.id,
            name: expense.category.name,
            color: expense.category.color,
          }
        : null,
      note: expense.note,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
    };
  }
}
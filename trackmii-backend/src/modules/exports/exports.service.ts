import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expense } from "../expenses/expense.entity";
import { ExportQueryDto } from "../exports/dtos/export-query.dto";

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,
  ) {}

  async exportToCsv(userId: string, query: ExportQueryDto): Promise<Buffer> {
    // Validate date range
    if (query.start_date && query.end_date) {
      if (new Date(query.start_date) > new Date(query.end_date)) {
        throw new BadRequestException('start_date must be before end_date');
      }
    }

    // Validate amount range
    if (
      query.min_amount !== undefined &&
      query.max_amount !== undefined &&
      query.min_amount > query.max_amount
    ) {
      throw new BadRequestException('min_amount must be less than max_amount');
    }

    if (query.min_amount !== undefined && query.min_amount < 0) {
      throw new BadRequestException('min_amount cannot be negative');
    }

    if (query.max_amount !== undefined && query.max_amount < 0) {
      throw new BadRequestException('max_amount cannot be negative');
    }

    // Build query with filters using QueryBuilder for proper range support
    let queryBuilder = this.expenseRepo
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.is_deleted = false')
      .orderBy('expense.expense_date', 'DESC');

    // Apply optional filters
    if (query.category_id) {
      queryBuilder = queryBuilder.andWhere('expense.category_id = :categoryId', {
        categoryId: query.category_id,
      });
    }

    if (query.payment_method) {
      queryBuilder = queryBuilder.andWhere('expense.payment_method = :method', {
        method: query.payment_method,
      });
    }

    if (query.start_date && query.end_date) {
      queryBuilder = queryBuilder.andWhere(
        'expense.expense_date BETWEEN :start AND :end',
        {
          start: query.start_date,
          end: query.end_date,
        },
      );
    }

    if (query.min_amount !== undefined) {
      queryBuilder = queryBuilder.andWhere('expense.amount >= :min', {
        min: query.min_amount,
      });
    }

    if (query.max_amount !== undefined) {
      queryBuilder = queryBuilder.andWhere('expense.amount <= :max', {
        max: query.max_amount,
      });
    }

    // Execute query with error handling
    let expenses: Expense[];
    try {
      expenses = await queryBuilder.getMany();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to export expenses: ${errorMessage}`,
      );
    }

    if (expenses.length === 0) {
      console.log(
        `No expenses found for user ${userId} with the given filters`,
      );
    }

    // Transform to CSV format
    const csvData = this.buildCsvData(expenses);
    return Buffer.from(csvData, 'utf-8');
  }

  private buildCsvData(expenses: Expense[]): string {
    const headers = [
      'Date',
      'Title',
      'Amount',
      'Currency',
      'Category',
      'Payment Method',
      'Note',
    ];

    const rows = expenses.map((expense) =>
      this.formatExpenseRow(expense),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  private formatExpenseRow(expense: Expense): string {
    const fields = [
      new Date(expense.expense_date).toLocaleDateString('en-US'),
      this.escapeCsvField(expense.title),
      expense.amount.toString(),
      expense.currency,
      expense.category ? this.escapeCsvField(expense.category.name) : 'N/A',
      expense.payment_method,
      expense.note ? this.escapeCsvField(expense.note) : '',
    ];

    return fields.join(',');
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
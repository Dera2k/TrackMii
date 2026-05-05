import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Expense } from "src/modules/expenses/expense.entity";
import { ExportQueryDto } from "./dtos/export-query.dto";
@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,
  ) {}

  async exportToCsv(userId: string, query: ExportQueryDto): Promise<Buffer> {
    const whereClause: any = {
      user_id: userId,
      is_deleted: false,
    };

    if (query.category_id) {
      whereClause.category_id = query.category_id;
    }

    if (query.payment_method) {
      whereClause.payment_method = query.payment_method;
    }

    if (query.start_date && query.end_date) {
      whereClause.expense_date = Between(query.start_date, query.end_date);
    }

    if (query.min_amount !== undefined || query.max_amount !== undefined) {
      // Handle amount range via query builder
    }

    const expenses = await this.expenseRepo.find({
      where: whereClause,
      relations: ['category'],
      order: { expense_date: 'DESC' },
    });

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
      expense.expense_date,
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
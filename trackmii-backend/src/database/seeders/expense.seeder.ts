import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { IsNull, Repository } from 'typeorm';

import { Expense } from '../../modules/expenses/expense.entity';
import { User } from '../../modules/users/user.entity';
import { Category } from '../../modules/categories/category.entity';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { Currency } from '../../common/enums/currency.enum';

const EXPENSE_COUNT = 500;
const MONTH_RANGE = 6;
const MIN_AMOUNT = 500;
const MAX_AMOUNT = 100_500;

@Injectable()
export class ExpenseSeeder {
  private readonly logger = new Logger(ExpenseSeeder.name);
  private readonly seedEmail: string;

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly configService: ConfigService,
  ) {
    this.seedEmail = this.configService.get('SEED_USER_EMAIL') || 'demo@example.com';
  }

  async seed(): Promise<void> {
    const user = await this.findSeedUser();

    if (!user) {
      this.logger.warn(`User not found: ${this.seedEmail}`);
      return;
    }

    const categories = await this.findAvailableCategories(user.id);

    if (categories.length === 0) {
      this.logger.warn('No categories found');
      return;
    }

    await this.expenseRepo.delete({ user_id: user.id });
    this.logger.log('Cleared existing expenses');

    const expenses = this.buildExpenses(user.id, categories);

    try {
      await this.expenseRepo.insert(expenses);
      this.logger.log(
        `Seeded ${expenses.length} expenses with ${categories.length} categories`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error seeding expenses: ${message}`);
    }
  }

  private findSeedUser(): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: this.seedEmail },
    });
  }

  private findAvailableCategories(userId: string): Promise<Category[]> {
    return this.categoryRepo.find({
      where: [{ user_id: userId }, { user_id: IsNull() }],
    });
  }

  private buildExpenses(
    userId: string,
    categories: Category[],
  ): Partial<Expense>[] {
    return Array.from({ length: EXPENSE_COUNT }, (_, index) =>
      this.buildExpense(index, userId, categories),
    );
  }

  private buildExpense(
    index: number,
    userId: string,
    categories: Category[],
  ): Partial<Expense> {
    const category = this.pickRandom(categories);
    const paymentMethod = this.pickRandom(Object.values(PaymentMethod));

    return {
      user_id: userId,
      title: `Expense ${index + 1}`,
      amount: this.randomAmount(),
      currency: Currency.NGN,
      category_id: category.id,
      payment_method: paymentMethod,
      expense_date: this.randomExpenseDate(),
      note: Math.random() > 0.7 ? `Note for expense ${index + 1}` : null,
      is_deleted: false,
    };
  }

  private randomAmount(): number {
    return Math.floor(Math.random() * (MAX_AMOUNT - MIN_AMOUNT)) + MIN_AMOUNT;
  }

  private randomExpenseDate(): string {
    const today = new Date();
    const monthsAgo = Math.floor(Math.random() * MONTH_RANGE);
    const dayOfMonth = Math.floor(Math.random() * 28) + 1;

    const date = new Date(
      today.getFullYear(),
      today.getMonth() - monthsAgo,
      dayOfMonth,
    );

    return date.toISOString().split('T')[0];
  }

  private pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}
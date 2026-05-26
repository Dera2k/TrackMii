import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Expense } from "../../modules/expenses/expense.entity"
import { User } from "../../modules/users/user.entity"
import { Category } from "../../modules/categories/category.entity"
import { PaymentMethod } from "../../common/enums/payment-method.enum"
import { Currency } from "../../common/enums/currency.enum"


@Injectable()
export class ExpenseSeeder {
  constructor(
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async seed() {
    const user = await this.userRepo.findOne({
      where: { email: 'exam@exam.com' },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Get user categories + default categories
    const categories = await this.categoryRepo.find({
      where: [
        { user_id: user.id },
        { user_id: IsNull() }, // System defaults
      ],
    });

    if (categories.length === 0) {
      console.log('❌ No categories found');
      return;
    }

    const expenses: Partial<Expense>[] = [];
    const today = new Date();
    const paymentMethods = Object.values(PaymentMethod);
    const currencies = Object.values(Currency);

    for (let i = 0; i < 500; i++) {
      const monthsAgo = Math.floor(Math.random() * 6);
      const dayOfMonth = Math.floor(Math.random() * 28) + 1;
      const expenseDate = new Date(
        today.getFullYear(),
        today.getMonth() - monthsAgo,
        dayOfMonth,
      );

      expenses.push({
        user_id: user.id,
        title: `Expense ${i + 1}`,
        amount: Math.floor(Math.random() * 100000) + 500,
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        category_id: categories[Math.floor(Math.random() * categories.length)].id,
        payment_method:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        expense_date: expenseDate.toISOString().split('T')[0],
        note: Math.random() > 0.7 ? `Note for expense ${i + 1}` : null,
        is_deleted: false,
      });
    }

    try {
      await this.expenseRepo.insert(expenses);
      console.log(`✅ Seeded ${expenses.length} expenses with ${categories.length} categories`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error seeding expenses:', message);
    }
  }
}
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../../app.module';
import { ExpenseSeeder } from './expense.seeder';
import { Expense } from '../../modules/expenses/expense.entity';
import { User } from '../../modules/users/user.entity';

const SEED_USER_EMAIL = 'exam@exam.com';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const command = process.argv[2];

    if (command === 'clean') {
      await cleanExpenses(app.get(DataSource));
      return;
    }

    const seeder = app.get(ExpenseSeeder);
    await seeder.seed();

    console.log('Seeding complete');
  } finally {
    await app.close();
  }
}

async function cleanExpenses(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const expenseRepo = dataSource.getRepository(Expense);

  const user = await userRepo.findOne({
    where: { email: SEED_USER_EMAIL },
  });

  if (!user) {
    console.log(`User not found: ${SEED_USER_EMAIL}`);
    return;
  }

  const result = await expenseRepo.delete({ user_id: user.id });

  console.log(`Deleted ${result.affected ?? 0} expenses from ${SEED_USER_EMAIL}`);
}

bootstrap();
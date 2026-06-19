import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '../../app.module';
import { ExpenseSeeder } from './expense.seeder';
import { Expense } from '../../modules/expenses/expense.entity';
import { User } from '../../modules/users/user.entity';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const seedEmail = configService.get('SEED_USER_EMAIL') || 'demo@example.com';

  try {
    const command = process.argv[2];

    if (command === 'clean') {
      await cleanExpenses(app.get(DataSource), seedEmail);
      return;
    }

    const seeder = app.get(ExpenseSeeder);
    await seeder.seed();

    console.log('Seeding complete');
  } finally {
    await app.close();
  }
}

async function cleanExpenses(dataSource: DataSource, email: string): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const expenseRepo = dataSource.getRepository(Expense);

  const user = await userRepo.findOne({
    where: { email },
  });

  if (!user) {
    console.log(`User not found: ${email}`);
    return;
  }

  const result = await expenseRepo.delete({ user_id: user.id });

  console.log(`Deleted ${result.affected ?? 0} expenses from ${email}`);
}

bootstrap();
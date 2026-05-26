import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ExpenseSeeder } from './expense.seeder';
import { getRepository } from 'typeorm';
import { Expense } from '../../modules/expenses/expense.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const command = process.argv[2];
  
  if (command === 'clean') {
    const expenseRepo = app.get('ExpenseRepository');
    await expenseRepo.delete({ note: /^Note for expense/i });
    console.log('✅ Cleaned test expenses');
  } else {
    const seeder = app.get(ExpenseSeeder);
    await seeder.seed();
    console.log('Seeding complete');
  }
  
  await app.close();
}

bootstrap();
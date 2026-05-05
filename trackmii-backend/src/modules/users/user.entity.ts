import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Budget } from '../budgets/budget.entity';
import { Currency } from '../../common/enums/currency.enum';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';
import { Notification } from '../notifications/notification.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string | null;

  @Column({ type: 'boolean', default: false })
  is_email_verified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_verification_token?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verification_expires?: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_reset_token?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  password_reset_expires?: Date | null;

  @Column({ type: 'enum', enum: Currency, default: Currency.NGN })
  currency!: Currency;

  @Column({ type: 'varchar', length: 50, default: 'Africa/Lagos' })
  timezone!: string;

  @Column({ type: 'boolean', default: false })
  dark_mode!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;


  //relationships
  @OneToMany(() => Expense, (expense) => expense.user)
  expenses!: Expense[];

  @OneToMany(() => Category, (category) => category.user)
  categories!: Category[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets!: Budget[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];
}
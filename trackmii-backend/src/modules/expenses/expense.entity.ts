import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Currency } from '../../common/enums/currency.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

@Entity('expenses')
@Index('idx_user_date', ['user_id', 'expense_date'])
@Index('idx_user_category', ['user_id', 'category_id'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid', nullable: true })
  category_id?: string | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, unsigned: true })
  amount!: number;

  @Column({ type: 'enum', enum: Currency })
  currency!: Currency;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  payment_method!: PaymentMethod;

  @Column({ type: 'date' })
  expense_date!: string;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;


  //relationships
  @ManyToOne(() => User, (user) => user.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Category, (category) => category.expenses, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}
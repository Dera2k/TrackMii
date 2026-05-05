import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Currency } from '../../common/enums/currency.enum';

@Entity('budgets')
@Unique('unique_budget', ['user_id', 'category_id', 'month', 'year'])
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid', nullable: true })
  category_id?: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, unsigned: true })
  amount!: number;

  @Column({ type: 'enum', enum: Currency })
  currency!: Currency;

  @Column({ type: 'tinyint' })
  month!: number;

  @Column({ type: 'smallint' })
  year!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;


  //relationships
  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Category, (category) => category.budgets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}
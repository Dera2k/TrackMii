import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, IsOptional, IsDateString, IsEnum, Min, Max } from 'class-validator';

import { Currency } from '../../../common/enums/currency.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Lunch',
    description: 'Expense title',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 2500,
    description: 'Expense amount',
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  @Max(999999999, { message: 'Amount exceeds maximum limit' })
  amount!: number;

  @IsEnum(Currency)
  @ApiProperty({
    enum: Currency,
    example: Currency.NGN,
    description: 'Expense currency',
  })
  currency!: Currency;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Category UUID',
  })
  @IsUUID()
  category_id!: string;

  @IsEnum(PaymentMethod)
  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    description: 'Payment method used',
  })
  payment_method!: PaymentMethod;

  @ApiProperty({
    example: '2026-04-20',
    description: 'Expense date in YYYY-MM-DD format',
  })
  @IsDateString()
  expense_date!: string;

  @ApiPropertyOptional({
    example: 'Quick lunch after work',
    description: 'Optional expense note',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
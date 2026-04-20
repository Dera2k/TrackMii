import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';


import { Currency } from 'src/common/enums/currency.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

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
  amount!: number;



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
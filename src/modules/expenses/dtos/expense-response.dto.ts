import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

export class ExpenseCategoryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;



  @ApiProperty({
    example: 'Food',
  })
  name!: string;


  
  @ApiProperty({
    example: '#FF5733',
  })
  color!: string;
}

export class ExpenseResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    example: 'Lunch',
  })
  title!: string;

  @ApiProperty({
    example: 2500,
  })
  amount!: number;

  @ApiProperty({
    enum: Currency,
    example: Currency.NGN,
  })
  currency!: Currency;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  payment_method!: PaymentMethod;

  @ApiProperty({
    example: '2026-04-20',
  })
  expense_date!: string;

  @ApiProperty({
    example: '2026-04-20T10:00:00.000Z',
  })
  created_at!: Date;

  @ApiProperty({
    example: '2026-04-20T12:00:00.000Z',
  })
  updated_at!: Date;

  @ApiPropertyOptional({
    type: ExpenseCategoryDto,
    nullable: true,
    description: 'Null if category was deleted',
  })
  category?: ExpenseCategoryDto | null;

  @ApiPropertyOptional({
    example: 'Quick lunch after work',
    nullable: true,
  })
  note?: string | null;
}
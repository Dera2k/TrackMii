import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';
import { CategoryNestedDto } from 'src/modules/categories/dtos/category-nested.dto';
export class BudgetResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440010',
    description: 'Budget unique identifier',
  })
  id!: string;

  @ApiProperty({
    example: 150000,
    description: 'Budget amount',
  })
  amount!: number;

  @ApiProperty({
    enum: Currency,
    example: Currency.NGN,
    description: 'Budget currency',
  })
  currency!: Currency;

  @ApiProperty({
    example: 4,
    description: 'Budget month (1-12)',
  })
  month!: number;

  @ApiProperty({
    example: 2026,
    description: 'Budget year',
  })
  year!: number;

  @ApiProperty({
    example: 45500,
    description: 'Calculated amount spent within budget period',
  })
  spent_amount!: number;

  @ApiProperty({
    example: 30.33,
    description: 'Calculated percentage of budget used',
  })
  usage_percentage!: number;

  @ApiProperty({
    example: '2026-04-01T09:00:00.000Z',
    description: 'Record creation timestamp',
  })
  created_at!: Date;

  @ApiProperty({
    example: '2026-04-10T11:30:00.000Z',
    description: 'Last update timestamp',
  })
  updated_at!: Date;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Category UUID. Null means overall monthly budget',
  })
  category_id!: string | null;

  @ApiProperty({
    type: CategoryNestedDto,
    nullable: true,
    description: 'Category details. Null for overall monthly budget',
  })
  category!: CategoryNestedDto | null;
}
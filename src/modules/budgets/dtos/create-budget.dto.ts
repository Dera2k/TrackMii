import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsUUID,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

import { Currency } from 'src/common/enums/currency.enum';

export class CreateBudgetDto {
  @ApiProperty({
    example: 150000,
    description: 'Budget amount',
  })
  @IsNumber()
  @Min(0)
  amount!: number;



  @ApiProperty({
    enum: Currency,
    example: Currency.NGN,
    description: 'Budget currency',
  })
  currency!: Currency;



  @ApiProperty({
    example: 4,
    description: 'Month number (1 - 12)',
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  month!: number;



  @ApiProperty({
    example: 2026,
    description: 'Budget year',
  })
  @IsNumber()
  year!: number;



  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Optional category UUID. Null means overall monthly budget',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;
}
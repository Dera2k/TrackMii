import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional,  IsUUID,  IsNumber,  IsString,  IsEnum } from 'class-validator';


import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

export class ExpenseQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({
    example: '2026-04-01',
  })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional({
    example: '2026-04-30',
  })
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiPropertyOptional({
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_amount?: number;

  @ApiPropertyOptional({
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_amount?: number;

  @ApiPropertyOptional({
    example: 'lunch',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['date', 'amount'],
    example: 'date',
  })
  @IsOptional()
  sort_by?: 'date' | 'amount';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  sort_order?: 'ASC' | 'DESC';
}
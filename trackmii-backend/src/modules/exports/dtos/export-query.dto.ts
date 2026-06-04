import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsArray } from 'class-validator';
import { ExpenseQueryDto } from '../../expenses/dtos/expense-query.dto';

export class ExportQueryDto extends PartialType(ExpenseQueryDto) {
  @ApiPropertyOptional({
    enum: ['last3days', 'last5days', 'last7days', 'last30days', 'thisMonth', 'last3months', 'last6months', 'lastYear'],
    example: 'last30days',
  })
  @IsOptional()
  @IsEnum(['last3days', 'last5days', 'last7days', 'last30days', 'thisMonth', 'last3months', 'last6months', 'lastYear'])
  preset?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['summary', 'insights', 'categories', 'payment', 'weekday', 'topExpenses', 'monthly', 'budget', 'details'],
  })
  @IsOptional()
  @IsArray()
  sections?: string[];
}
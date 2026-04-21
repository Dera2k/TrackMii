import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';
export class MonthlyAnalyticsItemDto {
  @ApiProperty({
    example: 4,
  })
  month!: number;

  @ApiProperty({
    example: 2026,
  })
  year!: number;


  @ApiProperty({
    example: 125000,
  })
  total_spent!: number;

  
  @ApiProperty({
    enum: Currency,
    example: Currency.NGN,
  })
  currency!: Currency;
}

export class MonthlyAnalyticsDto {
  @ApiProperty({
    type: [MonthlyAnalyticsItemDto],
  })
  data!: MonthlyAnalyticsItemDto[];
}
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';
export class WeeklyAnalyticsItemDto {
  @ApiProperty({
    example: '2026-04-13',
  })
  week_start_date!: string;

  @ApiProperty({
    example: '2026-04-19',
  })
  week_end_date!: string;


  @ApiProperty({
    example: 38500,
  })
  total_spent!: number;

  
  @ApiProperty({
    enum: Currency,
    example: Currency.NGN,
  })
  currency!: Currency;
}

export class WeeklyAnalyticsDto {
  @ApiProperty({
    type: [WeeklyAnalyticsItemDto],
  })
  data!: WeeklyAnalyticsItemDto[];
}
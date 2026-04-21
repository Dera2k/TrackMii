import { ApiProperty } from '@nestjs/swagger';

export class TopCategoryDto {
  @ApiProperty({
    example: 'Food',
  })
  name!: string;

  @ApiProperty({
    example: '#FF5733',
  })
  color!: string;



  @ApiProperty({
    example: 45500,
  })
  amount!: number;
}

export class DashboardStatsDto {
  @ApiProperty({
    example: 850000,
    description: 'Total amount spent across all time',
  })
  total_spent_all_time!: number;



  @ApiProperty({
    example: 125000,
    description: 'Amount spent in current month',
  })
  current_month_spent!: number;



  @ApiProperty({
    example: 200000,
    description: 'Current month budget amount',
  })
  current_month_budget!: number;



  @ApiProperty({
    example: 62.5,
    description: 'Current month budget usage percentage',
  })
  budget_usage_percentage!: number;


  
  @ApiProperty({
    type: TopCategoryDto,
    nullable: true,
    description: 'Highest spending category. Null if no expenses exist',
  })
  top_category!: TopCategoryDto | null;
}
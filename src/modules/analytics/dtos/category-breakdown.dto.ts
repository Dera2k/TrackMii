import { ApiProperty } from '@nestjs/swagger';

export class CategoryBreakdownItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  category_id!: string;

  @ApiProperty({
    example: 'Food',
  })
  category_name!: string;

  @ApiProperty({
    example: '#FF5733',
  })
  color!: string;

  @ApiProperty({
    example: 45500,
  })
  amount!: number;

  @ApiProperty({
    example: 36.4,
    description: 'Percentage of total spend',
  })
  percentage!: number;
}

export class CategoryBreakdownDto {
  @ApiProperty({
    type: [CategoryBreakdownItemDto],
  })
  data!: CategoryBreakdownItemDto[];
}
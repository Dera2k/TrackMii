import { ApiProperty } from '@nestjs/swagger';

export class CategoryNestedDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Category unique identifier',
  })
  id!: string;

  @ApiProperty({
    example: 'Food',
    description: 'Category name',
  })
  name!: string;

  @ApiProperty({
    example: '#FF5733',
    description: 'Category hex color code',
  })
  color!: string;
}
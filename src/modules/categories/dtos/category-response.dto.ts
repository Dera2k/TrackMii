import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Null for system default categories',
  })
  user_id?: string | null;

  @ApiProperty({
    example: 'Food',
  })
  name!: string;

  @ApiProperty({
    example: '#FF5733',
  })
  color!: string;

  @ApiProperty({
    example: false,
  })
  is_default!: boolean;

  @ApiProperty({
    example: '2026-04-20T10:00:00.000Z',
  })
  created_at!: Date;
}
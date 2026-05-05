import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({
    example: 3,
    description: 'Total unread notifications count',
  })
  count!: number;
}
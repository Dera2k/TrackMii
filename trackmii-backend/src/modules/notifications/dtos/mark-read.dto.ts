import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray,  IsOptional, IsUUID, ArrayUnique } from 'class-validator';


export class MarkReadDto {
  @ApiPropertyOptional({
    example: [ '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001' ],
    description:
      'Optional array of notification IDs. Omit or send empty array to mark all as read',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  notification_ids?: string[];
}
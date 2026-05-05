import { ApiProperty } from "@nestjs/swagger";
import { NotificationType } from "src/common/enums/notification-type.enum";

export class NotificationResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Notification unique identifier',
  })
  id!: string;


  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.BUDGET_WARNING,
    description: 'Notification category/type',
  })
  type!: NotificationType;


  @ApiProperty({
    example: 'Budget Warning',
    description: 'Notification title',
  })
  title!: string;


  @ApiProperty({
    example: 'You have used 85% of your monthly Food budget.',
    description: 'Notification message',
  })
  message!: string;


  @ApiProperty({
    example: false,
    description: 'Whether notification has been read',
  })
  is_read!: boolean;

  
  @ApiProperty({
    example: '2026-04-21T09:30:00.000Z',
    description: 'Notification creation timestamp',
  })
  created_at!: Date;
}
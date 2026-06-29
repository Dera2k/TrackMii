import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto } from './dtos/notification-response.dto';
import { MarkReadDto } from './dtos/mark-read.dto';
import { UnreadCountResponseDto } from './dtos/unread-count-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({
    name: 'is_read',
    required: false,
    type: Boolean,
    description: 'Filter by read status',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved',
    type: [NotificationResponseDto],
  })
  async findAll(
    @CurrentUser() user: any,
    @Query('is_read', new ParseBoolPipe({ optional: true }))
    isRead?: boolean,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.findAll(user.id, isRead);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved',
    type: UnreadCountResponseDto,
  })
  async getUnreadCount(
    @CurrentUser() user: any,
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Put('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read',
  })
  async markAsRead(
    @CurrentUser() user: any,
    @Body() dto: MarkReadDto,
  ): Promise<{ message: string }> {
    if (!dto.notification_ids || dto.notification_ids.length === 0) {
      await this.notificationsService.markAllAsRead(user.id);
      return { message: 'All notifications marked as read' };
    }

    await this.notificationsService.markAsRead(user.id, dto.notification_ids);
    return { message: 'Notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted',
  })
  async deleteNotification(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.notificationsService.delete(user.id, id);
    return { message: 'Notification deleted' };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  @ApiResponse({
    status: 200,
    description: 'All notifications deleted',
  })
  async deleteAll(
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.notificationsService.deleteAll(user.id);
    return { message: 'All notifications deleted' };
  }
}
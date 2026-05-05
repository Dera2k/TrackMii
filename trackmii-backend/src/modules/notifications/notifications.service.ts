import { NotificationType } from "../../common/enums/notification-type.enum"
import { Notification } from "./notification.entity";
import { NotificationResponseDto } from "./dtos/notification-response.dto";
import { Repository, In } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<void> {
    const notification = this.notificationRepo.create({
      user_id: userId,
      type,
      title,
      message,
    });

    await this.notificationRepo.save(notification);
  }

  async findAll(
    userId: string,
    isRead?: boolean,
  ): Promise<NotificationResponseDto[]> {
    const whereClause: any = { user_id: userId };

    if (isRead !== undefined) {
      whereClause.is_read = isRead;
    }

    const notifications = await this.notificationRepo.find({
      where: whereClause,
      order: { created_at: 'DESC' },
    });

    return notifications.map((n) => this.toResponseDto(n));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    await this.notificationRepo.update(
      {
        user_id: userId,
        id: In(notificationIds),
      },
      { is_read: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      {
        user_id: userId,
        is_read: false,
      },
      { is_read: true },
    );
  }

  async checkDuplicate(
    userId: string,
    type: NotificationType,
    categoryId: string | null,
    month: number,
    year: number,
  ): Promise<boolean> {
    const titlePattern = categoryId
      ? `%category%${month}/${year}%`
      : `%overall budget%${month}/${year}%`;

    const existing = await this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .andWhere('notification.type = :type', { type })
      .andWhere('notification.title LIKE :titlePattern', { titlePattern })
      .getOne();

    return !!existing;
  }

  toResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: notification.is_read,
      created_at: notification.created_at,
    };
  }
}
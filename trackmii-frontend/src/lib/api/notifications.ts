import { apiClient } from "./client"
import type { Notification } from "@/lib/types"

export async function getNotifications(): Promise<Notification[]> {
  return apiClient("/notifications")
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient<{ count: number }>("/notifications/unread-count")
  return res.count
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  await apiClient("/notifications/mark-read", {
    method: "PUT",
    body: JSON.stringify({ notification_ids: ids }),
  })
}
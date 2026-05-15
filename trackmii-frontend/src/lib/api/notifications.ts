import { apiClient } from "./client"
import type { Notification } from "@/lib/types"

export async function getNotifications(): Promise<Notification[]> {
  return apiClient("/notifications")
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient<{ unread_count: number }>("/notifications/unread-count")
  return res.unread_count
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  return apiClient("/notifications/mark-read", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notification_ids: ids }),
  })
}
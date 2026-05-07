import { apiClient } from "./client"
import type { Notification } from "@/lib/types"

export async function getNotifications(is_read?: boolean): Promise<Notification[]> {
  const query = is_read !== undefined ? `?is_read=${is_read}` : ""
  return apiClient<Notification[]>(`/notifications${query}`)
}

export async function getUnreadCount(): Promise<number> {
  return apiClient<number>("/notifications/unread-count")
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  return apiClient("/notifications/mark-read", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  })
}

//nnotification calls. Pass an empty array [] to mark all as read per backend spec.
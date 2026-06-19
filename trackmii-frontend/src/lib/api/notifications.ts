import { apiClient } from "./client"
import type { Notification } from "@/lib/types"

async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (error.statusCode === 401) throw new Error("Session expired. Please log in again.")
    if (error.statusCode >= 500) throw new Error("Server error. Try again later.")
    throw new Error(error.message || "Something went wrong.")
  }
}

export async function getNotifications(): Promise<Notification[]> {
  return handleApiCall(() => apiClient("/notifications"))
}

export async function getUnreadCount(): Promise<number> {
  return handleApiCall(async () => {
    const res = await apiClient<{ count: number }>("/notifications/unread-count")
    return res.count
  })
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  return handleApiCall(() =>
    apiClient("/notifications/mark-read", {
      method: "PUT",
      body: JSON.stringify({ notification_ids: ids }),
    })
  )
}
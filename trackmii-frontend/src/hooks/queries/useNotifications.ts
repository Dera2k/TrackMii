"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getNotifications,
  getUnreadCount,
  markNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/api/notifications"
import { toast } from "sonner"

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
      toast.success("Notification deleted")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete notification")
    },
  })
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
      toast.success("All notifications deleted")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete notifications")
    },
  })
}
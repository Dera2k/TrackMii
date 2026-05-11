"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getNotifications,
  getUnreadCount,
  markNotificationsRead,
} from "@/lib/api/notifications"
import { NOTIFICATION_POLL_INTERVAL } from "@/lib/constants"

export function useNotifications(is_read?: boolean) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(is_read),
    refetchInterval: NOTIFICATION_POLL_INTERVAL,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: NOTIFICATION_POLL_INTERVAL,
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
    },
  })
}
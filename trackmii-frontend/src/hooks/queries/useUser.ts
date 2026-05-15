"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateProfile,
  updatePreferences,
  updatePassword,
} from "@/lib/api/user"
import { toast } from "sonner"

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string }) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      toast.success("Profile updated")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile")
    },
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { currency?: string; dark_mode?: boolean }) =>
      updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      toast.success("Preferences updated")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update preferences")
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      updatePassword(data),
    onSuccess: () => {
      toast.success("Password changed")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to change password")
    },
  })
}
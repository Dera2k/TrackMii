"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProfile, updateProfile, updatePreferences, updatePassword } from "@/lib/api/user"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "sonner"

export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { setUser } = useAuth()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user", "profile"], updatedUser)
      queryClient.setQueryData(["auth", "me"], updatedUser)
      setUser(updatedUser)
      toast.success("Profile updated")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const { setUser } = useAuth()

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user", "profile"], updatedUser)
      queryClient.setQueryData(["auth", "me"], updatedUser)
      setUser(updatedUser)
      toast.success("Preferences saved")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
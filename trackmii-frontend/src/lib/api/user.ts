//User profile and preferences API. Password update is separate from profile update per backend spec.

import { apiClient } from "./client"
import type { User, Currency } from "@/lib/types"

export async function getProfile(): Promise<User> {
  return apiClient<User>("/users/profile")
}

export async function updateProfile(data: Partial<{
  name: string
  email: string
}>): Promise<User> {
  return apiClient<User>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function updatePreferences(data: Partial<{
  currency: Currency
  timezone: string
  dark_mode: boolean
}>): Promise<User> {
  return apiClient<User>("/users/preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function updatePassword(data: {
  current_password: string
  new_password: string
}): Promise<void> {
  return apiClient("/users/password", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}
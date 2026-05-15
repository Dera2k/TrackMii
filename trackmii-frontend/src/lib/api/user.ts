import { apiClient } from "./client"
import type { User } from "@/lib/types"

export async function getProfile(): Promise<User> {
  return apiClient("/users/profile")
}

export async function updateProfile(data: {
  name: string
  email: string
}): Promise<User> {
  return apiClient("/users/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updatePreferences(data: {
  currency?: string
  dark_mode?: boolean
}): Promise<User> {
  return apiClient("/users/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updatePassword(data: {
  current_password: string
  new_password: string
}): Promise<void> {
  return apiClient("/users/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}
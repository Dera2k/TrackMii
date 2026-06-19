import { apiClient } from "./client"
import type { User } from "@/lib/types"

async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (error.statusCode === 401) throw new Error("Session expired. Please log in again.")
    if (error.statusCode === 400) throw new Error(error.message)
    if (error.statusCode >= 500) throw new Error("Server error. Try again later.")
    throw new Error(error.message || "Something went wrong.")
  }
}

export async function getProfile(): Promise<User> {
  return handleApiCall(() => apiClient("/users/profile"))
}

export async function updateProfile(data: {
  name: string
  email: string
}): Promise<User> {
  return handleApiCall(() =>
    apiClient("/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function updatePreferences(data: {
  currency?: string
  dark_mode?: boolean
}): Promise<User> {
  return handleApiCall(() =>
    apiClient("/users/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function updatePassword(data: {
  current_password: string
  new_password: string
}): Promise<void> {
  return handleApiCall(() =>
    apiClient("/users/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}
import { apiClient } from "./client"
import { setToken } from "@/lib/auth"
import type { AuthResponse, User } from "@/lib/types"

async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (error.statusCode === 401) throw new Error("Invalid email or password.")
    if (error.statusCode === 409) throw new Error(error.message)
    if (error.statusCode >= 500) throw new Error("Server error. Try again later.")
    throw new Error(error.message || "Something went wrong.")
  }
}

export async function register(data: {
  name: string
  email: string
  password: string
}): Promise<AuthResponse> {
  return handleApiCall(async () => {
    const result = await apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    })
    setToken(result.access_token)
    return result
  })
}

export async function login(data: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return handleApiCall(async () => {
    const result = await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    })
    setToken(result.access_token)
    return result
  })
}

export async function forgotPassword(email: string): Promise<void> {
  return handleApiCall(() =>
    apiClient("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    })
  )
}

export async function resetPassword(data: {
  token: string
  password: string
}): Promise<void> {
  return handleApiCall(() =>
    apiClient("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    })
  )
}

export async function getMe(): Promise<User> {
  return handleApiCall(() => apiClient<User>("/users/profile"))
}
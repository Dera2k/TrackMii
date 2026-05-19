import { apiClient } from "./client"
import { setToken } from "@/lib/auth"
import type { AuthResponse, User } from "@/lib/types"

export async function register(data: {
  name: string
  email: string
  password: string
}): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  })
  setToken(result.access_token)
  return result
}

export async function login(data: {
  email: string
  password: string
}): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  })
  setToken(result.access_token)
  return result
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  })
}

export async function resetPassword(data: {
  token: string
  password: string
}): Promise<void> {
  await apiClient("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  })
}

export async function getMe(): Promise<User> {
  return apiClient<User>("/users/profile")
}

//auth API functions. register and login automatically store the returned JWT via setToken. skipAuth: true means these requests don't attach a token since the user isn't authenticated yet.


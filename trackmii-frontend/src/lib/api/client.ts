import { getToken, clearToken } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"

//Central fetch wrapper. Automatically attaches JWT from localStorage to every request. On 401 (expired token), clears token and redirects to login. Normalizes all errors into a consistent ApiError class. All API modules use this instead of raw fetch.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"
interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers)
  headers.set("Content-Type", "application/json")

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (response.status === 401) {
    clearToken()
    window.location.href = "/login"
    throw new ApiError(401, "Session expired. Please log in again.")
  }

  const json = await response.json()

  if (!response.ok) {
    throw new ApiError(
      json.statusCode ?? response.status,
      json.message ?? "An error occurred",
      json.error
    )
  }

  return (json as ApiResponse<T>).data
}
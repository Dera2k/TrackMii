import { clearToken, getToken } from "@/lib/auth"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: string[]
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiClient<T>(
  url: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options
  const token = getToken()
  const headers = new Headers(fetchOptions.headers ?? {})

  headers.set("Content-Type", "application/json")

  if (token && !skipAuth) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...fetchOptions,
    headers,
  })

  const wrapper = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      clearToken()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }

    const errors = wrapper.error instanceof Array ? wrapper.error : undefined
    throw new ApiError(
      response.status,
      wrapper.message || "Request failed",
      errors
    )
  }

  return wrapper.data ?? wrapper
}
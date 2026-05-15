import { clearToken, getToken } from "@/lib/auth"

interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiClient<T>(
  url: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options

  const token = getToken()
  const headers = new Headers(fetchOptions.headers ?? {})

  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    {
      ...fetchOptions,
      headers,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      clearToken()
      window.location.href = "/login"
    }

    throw new ApiError(
      response.status,
      data.message || "Request failed",
      data
    )
  }

  return data.data ?? data
}
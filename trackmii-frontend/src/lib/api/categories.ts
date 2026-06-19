import { apiClient } from "./client"
import type { Category } from "@/lib/types"

async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (error.statusCode === 401) throw new Error("Session expired. Please log in again.")
    if (error.statusCode === 404) throw new Error("Category not found.")
    if (error.statusCode === 409) throw new Error(error.message)
    if (error.statusCode >= 500) throw new Error("Server error. Try again later.")
    throw new Error(error.message || "Something went wrong.")
  }
}

export async function getCategories(): Promise<Category[]> {
  return handleApiCall(() => apiClient("/categories"))
}

export async function getCategory(id: string): Promise<Category> {
  return handleApiCall(() => apiClient(`/categories/${id}`))
}

export async function createCategory(data: {
  name: string
  color: string
}): Promise<Category> {
  return handleApiCall(() =>
    apiClient("/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateCategory(
  id: string,
  data: { name: string; color: string }
): Promise<Category> {
  return handleApiCall(() =>
    apiClient(`/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteCategory(id: string): Promise<void> {
  return handleApiCall(() => apiClient(`/categories/${id}`, { method: "DELETE" }))
}
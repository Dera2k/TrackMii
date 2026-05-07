import { apiClient } from "./client"
import type { Category } from "@/lib/types"

export async function getCategories(): Promise<Category[]> {
  return apiClient<Category[]>("/categories")
}

export async function getCategory(id: string): Promise<Category> {
  return apiClient<Category>(`/categories/${id}`)
}

export async function createCategory(data: {
  name: string
  color: string
}): Promise<Category> {
  return apiClient<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateCategory(id: string, data: Partial<{
  name: string
  color: string
}>): Promise<Category> {
  return apiClient<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  return apiClient(`/categories/${id}`, { method: "DELETE" })
}

//CRUD for categories. System defaults (is_default: true) are blocked from deletion by the backend — frontend just surfaces the error.
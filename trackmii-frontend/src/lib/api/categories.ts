import { apiClient } from "./client"
import type { Category } from "@/lib/types"

export async function getCategories(): Promise<Category[]> {
  return apiClient("/categories")
}

export async function getCategory(id: string): Promise<Category> {
  return apiClient(`/categories/${id}`)
}

export async function createCategory(data: {
  name: string
  color: string
}): Promise<Category> {
  return apiClient("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updateCategory(
  id: string,
  data: { name: string; color: string }
): Promise<Category> {
  return apiClient(`/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  return apiClient(`/categories/${id}`, { method: "DELETE" })
}
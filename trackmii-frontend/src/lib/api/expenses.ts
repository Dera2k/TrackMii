import { apiClient } from "./client"
import type { Expense, PaginatedResponse } from "@/lib/types"

export interface ExpenseFilters {
  page?: number
  limit?: number
  search?: string
  category_id?: string
  payment_method?: string
  start_date?: string
  end_date?: string
}

// Wraps API calls and translates errors to user messages
async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    // Network error or no response
    if (!error.response) {
      throw new Error("Network error. Check your connection.")
    }

    // Server error responses
    const status = error.response.status
    const message = error.response.data?.message || "Something went wrong"

    if (status === 401) throw new Error("Session expired. Please log in again.")
    if (status === 403) throw new Error("You don't have permission to do this.")
    if (status === 404) throw new Error("Not found.")
    if (status === 409) throw new Error(message) // Conflict (duplicate, etc)
    if (status >= 500) throw new Error("Server error. Try again later.")

    throw new Error(message)
  }
}

export async function getExpenses(
  filters: ExpenseFilters = {}
): Promise<PaginatedResponse<Expense>> {
  const params = new URLSearchParams()

  if (filters.page) params.append("page", String(filters.page))
  if (filters.limit) params.append("limit", String(filters.limit))
  if (filters.search) params.append("search", filters.search)
  if (filters.category_id) params.append("category_id", filters.category_id)
  if (filters.payment_method) params.append("payment_method", filters.payment_method)
  if (filters.start_date) params.append("start_date", filters.start_date)
  if (filters.end_date) params.append("end_date", filters.end_date)

  return handleApiCall(() => apiClient(`/expenses?${params.toString()}`))
}

export async function getExpense(id: string): Promise<Expense> {
  return handleApiCall(() => apiClient(`/expenses/${id}`))
}

export async function createExpense(data: Partial<Expense>): Promise<Expense> {
  return handleApiCall(() =>
    apiClient("/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateExpense(
  id: string,
  data: Partial<Expense>
): Promise<Expense> {
  return handleApiCall(() =>
    apiClient(`/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteExpense(id: string): Promise<void> {
  return handleApiCall(() => apiClient(`/expenses/${id}`, { method: "DELETE" }))
}

export async function bulkDeleteExpenses(ids: string[]): Promise<void> {
  return handleApiCall(() =>
    apiClient("/expenses/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
  )
}
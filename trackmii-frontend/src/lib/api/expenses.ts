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

  return apiClient(`/expenses?${params.toString()}`)
}

export async function getExpense(id: string): Promise<Expense> {
  return apiClient(`/expenses/${id}`)
}

export async function createExpense(data: Partial<Expense>): Promise<Expense> {
  return apiClient("/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updateExpense(
  id: string,
  data: Partial<Expense>
): Promise<Expense> {
  return apiClient(`/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteExpense(id: string): Promise<void> {
  return apiClient(`/expenses/${id}`, { method: "DELETE" })
}

export async function bulkDeleteExpenses(ids: string[]): Promise<void> {
  return apiClient("/expenses/bulk", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  })
}
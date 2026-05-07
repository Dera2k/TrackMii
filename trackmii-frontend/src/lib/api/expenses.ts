import { apiClient } from "./client"
import type { Expense, PaginatedResponse } from "@/lib/types"

export interface ExpenseFilters {
  page?: number
  limit?: number
  category_id?: string
  payment_method?: string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  search?: string
  sort_by?: "date" | "amount"
  sort_order?: "ASC" | "DESC"
}

export async function getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v))
  })
  return apiClient<PaginatedResponse<Expense>>(`/expenses?${params.toString()}`)
}

export async function getExpense(id: string): Promise<Expense> {
  return apiClient<Expense>(`/expenses/${id}`)
}

export async function createExpense(data: {
  title: string
  amount: number
  currency: string
  category_id?: string
  payment_method: string
  expense_date: string
  note?: string
}): Promise<Expense> {
  return apiClient<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateExpense(id: string, data: Partial<{
  title: string
  amount: number
  currency: string
  category_id: string
  payment_method: string
  expense_date: string
  note: string
}>): Promise<Expense> {
  return apiClient<Expense>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteExpense(id: string): Promise<void> {
  return apiClient(`/expenses/${id}`, { method: "DELETE" })
}

export async function bulkDeleteExpenses(ids: string[]): Promise<void> {
  return apiClient("/expenses/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  })
}

//All expense API calls. Filters are converted to query params automatically, undefined values are skipped.
import { apiClient } from "./client"
import type { Budget } from "@/lib/types"

export async function getBudgets(): Promise<Budget[]> {
  return apiClient<Budget[]>("/budgets")
}

export async function getCurrentMonthBudgets(): Promise<Budget[]> {
  return apiClient<Budget[]>("/budgets/current-month")
}

export async function getBudget(id: string): Promise<Budget> {
  return apiClient<Budget>(`/budgets/${id}`)
}

export async function createBudget(data: {
  category_id?: string
  amount: number
  currency: string
  month: number
  year: number
}): Promise<Budget> {
  return apiClient<Budget>("/budgets", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateBudget(id: string, data: Partial<{
  amount: number
  currency: string
}>): Promise<Budget> {
  return apiClient<Budget>(`/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteBudget(id: string): Promise<void> {
  return apiClient(`/budgets/${id}`, { method: "DELETE" })
}
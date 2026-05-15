import { apiClient } from "./client"
import type { Budget } from "@/lib/types"

export interface BudgetData {
  category_id?: string
  amount: number
  currency: string
  month: number
  year: number
}

export async function getBudgets(): Promise<Budget[]> {
  return apiClient("/budgets")
}

export async function getCurrentMonthBudgets(): Promise<Budget[]> {
  const now = new Date()
  return apiClient(`/budgets/current-month?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
}

export async function getBudget(id: string): Promise<Budget> {
  return apiClient(`/budgets/${id}`)
}

export async function createBudget(data: BudgetData): Promise<Budget> {
  return apiClient("/budgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updateBudget(
  id: string,
  data: { amount: number; currency: string }
): Promise<Budget> {
  return apiClient(`/budgets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteBudget(id: string): Promise<void> {
  return apiClient(`/budgets/${id}`, { method: "DELETE" })
}
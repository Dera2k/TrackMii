import { apiClient } from "./client"
import type { Budget } from "@/lib/types"

export interface BudgetData {
  category_id?: string
  amount: number
  currency: string
  month: number
  year: number
}

async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (error.statusCode === 401) throw new Error("Session expired. Please log in again.")
    if (error.statusCode === 403) throw new Error("You don't have permission.")
    if (error.statusCode === 404) throw new Error("Budget not found.")
    if (error.statusCode === 409) throw new Error(error.message)
    if (error.statusCode >= 500) throw new Error("Server error. Try again later.")
    throw new Error(error.message || "Something went wrong.")
  }
}

export async function getBudgets(): Promise<Budget[]> {
  return handleApiCall(() => apiClient("/budgets"))
}

export async function getCurrentMonthBudgets(): Promise<Budget[]> {
  return handleApiCall(() => {
    const now = new Date()
    return apiClient(`/budgets/current-month?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
  })
}

export async function getBudget(id: string): Promise<Budget> {
  return handleApiCall(() => apiClient(`/budgets/${id}`))
}

export async function createBudget(data: BudgetData): Promise<Budget> {
  return handleApiCall(() =>
    apiClient("/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function updateBudget(
  id: string,
  data: { amount: number; currency: string }
): Promise<Budget> {
  return handleApiCall(() =>
    apiClient(`/budgets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  )
}

export async function deleteBudget(id: string): Promise<void> {
  return handleApiCall(() => apiClient(`/budgets/${id}`, { method: "DELETE" }))
}
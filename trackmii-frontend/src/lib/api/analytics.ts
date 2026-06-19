import { apiClient } from "./client"
import type { Currency } from "@/lib/types"

export interface DashboardStats {
  total_spent_all_time: number
  current_month_spent: number
  current_month_budget: number
  budget_usage_percentage: number
  transaction_count: number
  top_category: {
    name: string
    color: string
    amount: number
  } | null
}

export interface MonthlyTrend {
  month: number
  year: number
  total_spent: number
  currency: Currency
}

export interface MonthlyTrendsResponse {
  data: MonthlyTrend[]
}

export interface WeeklyTrend {
  week_start_date: string
  week_end_date: string
  total_spent: number
  currency: Currency
}

export interface WeeklyTrendsResponse {
  data: WeeklyTrend[]
}

export interface CategoryBreakdown {
  category_id: string
  category_name: string
  color: string
  amount: number
  percentage: number
}

export interface CategoryBreakdownResponse {
  data: CategoryBreakdown[]
}

async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (error.statusCode === 401) throw new Error("Session expired. Please log in again.")
    if (error.statusCode === 403) throw new Error("You don't have permission.")
    if (error.statusCode === 404) throw new Error("Not found.")
    if (error.statusCode >= 500) throw new Error("Server error. Try again later.")
    throw new Error(error.message || "Something went wrong.")
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return handleApiCall(() => apiClient("/analytics/dashboard"))
}

export async function getMonthlyTrends(months: number = 6): Promise<MonthlyTrendsResponse> {
  return handleApiCall(() => apiClient(`/analytics/monthly?months=${months}`))
}

export async function getWeeklyTrends(weeks: number = 8): Promise<WeeklyTrendsResponse> {
  return handleApiCall(() => apiClient(`/analytics/weekly?weeks=${weeks}`))
}

export async function getCategoryBreakdown(
  startDate?: string,
  endDate?: string
): Promise<CategoryBreakdownResponse> {
  return handleApiCall(() => {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    return apiClient(`/analytics/category-breakdown?${params.toString()}`)
  })
}
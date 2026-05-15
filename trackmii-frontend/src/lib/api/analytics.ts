import { apiClient } from "./client"
import type { Currency } from "@/lib/types"

export interface DashboardStats {
  total_spent_all_time: number
  current_month_spent: number
  transaction_count: number
  top_category: {
    name: string
    color: string
  } | null
}

export interface MonthlyTrend {
  month: number
  year: number
  total: number
}

export interface WeeklyTrend {
  week: number
  total: number
}

export interface CategoryBreakdown {
  category_id: string
  category_name: string
  color: string
  total: number
  percentage: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient("/analytics/dashboard")
}

export async function getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
  return apiClient(`/analytics/monthly?months=${months}`)
}

export async function getWeeklyTrends(weeks: number = 8): Promise<WeeklyTrend[]> {
  return apiClient(`/analytics/weekly?weeks=${weeks}`)
}

export async function getCategoryBreakdown(
  startDate?: string,
  endDate?: string
): Promise<CategoryBreakdown[]> {
  const params = new URLSearchParams()
  if (startDate) params.append("start_date", startDate)
  if (endDate) params.append("end_date", endDate)
  return apiClient(`/analytics/category-breakdown?${params.toString()}`)
}
import { apiClient } from "./client"

export interface DashboardStats {
  total_spent_all_time: number
  current_month_spent: number
  current_month_budget: number | null
  budget_usage_percentage: number | null
  top_category: { name: string; color: string; amount: number } | null
}

export interface MonthlyTrend {
  month: number
  year: number
  total: number
}

export interface WeeklyTrend {
  week: number
  year: number
  total: number
}

export interface CategoryBreakdown {
  category_id: string | null
  category_name: string
  color: string
  total: number
  percentage: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient<DashboardStats>("/analytics/dashboard")
}

export async function getMonthlyTrends(months = 6): Promise<MonthlyTrend[]> {
  return apiClient<MonthlyTrend[]>(`/analytics/monthly?months=${months}`)
}

export async function getWeeklyTrends(weeks = 8): Promise<WeeklyTrend[]> {
  return apiClient<WeeklyTrend[]>(`/analytics/weekly?weeks=${weeks}`)
}

export async function getCategoryBreakdown(params?: {
  start_date?: string
  end_date?: string
}): Promise<CategoryBreakdown[]> {
  const query = new URLSearchParams()
  if (params?.start_date) query.set("start_date", params.start_date)
  if (params?.end_date) query.set("end_date", params.end_date)
  return apiClient<CategoryBreakdown[]>(`/analytics/category-breakdown?${query.toString()}`)
}
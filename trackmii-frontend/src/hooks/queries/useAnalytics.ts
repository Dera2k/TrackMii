"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getDashboardStats,
  getMonthlyTrends,
  getWeeklyTrends,
  getCategoryBreakdown,
} from "@/lib/api/analytics"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5,
  })
}

export function useMonthlyTrends(months: number = 6) {
  return useQuery({
    queryKey: ["analytics", "monthly", months],
    queryFn: () => getMonthlyTrends(months),
    staleTime: 1000 * 60 * 5,
  })
}

export function useWeeklyTrends(weeks: number = 8) {
  return useQuery({
    queryKey: ["analytics", "weekly", weeks],
    queryFn: () => getWeeklyTrends(weeks),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCategoryBreakdown(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ["analytics", "category-breakdown", params?.start_date, params?.end_date],
    queryFn: () => getCategoryBreakdown(params?.start_date, params?.end_date),
    staleTime: 1000 * 60 * 5,
  })
}
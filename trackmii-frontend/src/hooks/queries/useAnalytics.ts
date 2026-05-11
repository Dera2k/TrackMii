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
    staleTime: 30 * 1000,
  })
}

export function useMonthlyTrends(months = 6) {
  return useQuery({
    queryKey: ["analytics", "monthly", months],
    queryFn: () => getMonthlyTrends(months),
    staleTime: 5 * 60 * 1000,
  })
}

export function useWeeklyTrends(weeks = 8) {
  return useQuery({
    queryKey: ["analytics", "weekly", weeks],
    queryFn: () => getWeeklyTrends(weeks),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoryBreakdown(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ["analytics", "category-breakdown", params ?? {}],
    queryFn: () => getCategoryBreakdown(params),
    staleTime: 60 * 1000,
  })
}
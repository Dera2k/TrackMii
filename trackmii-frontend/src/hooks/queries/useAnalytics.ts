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

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: ["analytics", "category-breakdown"],
    queryFn: () => getCategoryBreakdown(),
    staleTime: 1000 * 60 * 5,
  })
}
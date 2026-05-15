"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBudgets,
  getCurrentMonthBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  type BudgetData,
} from "@/lib/api/budgets"
import { toast } from "sonner"
import type { Budget } from "@/lib/types"

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCurrentMonthBudgets() {
  return useQuery({
    queryKey: ["budgets", "current-month"],
    queryFn: getCurrentMonthBudgets,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Budget created")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create budget")
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: number; currency: string } }) =>
      updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Budget updated")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update budget")
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.success("Budget deleted")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete budget")
    },
  })
}
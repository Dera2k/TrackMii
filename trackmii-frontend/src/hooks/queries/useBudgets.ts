"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBudgets,
  getCurrentMonthBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} from "@/lib/api/budgets"
import { toast } from "sonner"

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
    staleTime: 60 * 1000,
  })
}

export function useCurrentMonthBudgets() {
  return useQuery({
    queryKey: ["budgets", "current-month"],
    queryFn: getCurrentMonthBudgets,
    staleTime: 30 * 1000,
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ["budgets", id],
    queryFn: () => getBudget(id),
    enabled: !!id,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })
      toast.success("Budget created")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateBudget>[1] }) =>
      updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      toast.success("Budget updated")
    },
    onError: (error: Error) => {
      toast.error(error.message)
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
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getExpenses, createExpense, updateExpense, deleteExpense, type ExpenseFilters } from "@/lib/api/expenses"
import { toast } from "sonner"
import type { Expense } from "@/lib/types"

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => getExpenses(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      const { data } = await getExpenses()
      return data.find((e: Expense) => e.id === id)
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Expense added")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add expense")
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      updateExpense(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] })
      const previous = queryClient.getQueryData(["expenses"])
      
      // Only update cache if data exists
      if (previous) {
        queryClient.setQueryData(["expenses"], (old: any) => ({
          ...old,
          data: old.data.map((e: Expense) => (e.id === id ? { ...e, ...data } : e)),
        }))
      }
      
      return { previous }
    },
    onError: (error: any, variables, context: any) => {
      if (context.previous) {
        queryClient.setQueryData(["expenses"], context.previous)
      }
      toast.error(error.message || "Failed to update expense")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Expense updated")
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["budgets"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Expense deleted")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete expense")
    },
  })
}
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, bulkDeleteExpenses } from "@/lib/api/expenses"
import type { ExpenseFilters } from "@/lib/api/expenses"
import type { Expense } from "@/lib/types"
import { toast } from "sonner"

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: ["expenses", "list", filters],
    queryFn: () => getExpenses(filters),
    staleTime: 30 * 1000,
  })
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: () => getExpense(id),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["budgets", "current-month"] })
      toast.success("Expense added")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateExpense>[1] }) =>
      updateExpense(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["expenses", id] })
      const previous = queryClient.getQueryData<Expense>(["expenses", id])
      queryClient.setQueryData(["expenses", id], (old: Expense) => ({ ...old, ...data }))
      return { previous }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["expenses", id] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })
      toast.success("Expense updated")
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["expenses", id], context.previous)
      }
      toast.error(error.message)
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["budgets", "current-month"] })
      toast.success("Expense deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useBulkDeleteExpenses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkDeleteExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] })
      toast.success("Expenses deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
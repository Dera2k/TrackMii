"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api/categories"
import { toast } from "sonner"
import type { Category } from "@/lib/types"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category created")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create category")
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; color: string } }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category updated")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category")
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      toast.success("Category deleted")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category")
    },
  })
}
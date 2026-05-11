"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory} from "@/lib/api/categories"
import { toast } from "sonner"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => getCategory(id),
    enabled: !!id,
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
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category updated")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Category deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
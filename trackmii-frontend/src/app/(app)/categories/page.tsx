"use client"

import { useState } from "react"
import { useCategories, useDeleteCategory } from "@/hooks/queries/useCategories"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { CategoryForm } from "@/components/categories/CategoryForm"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/lib/types"

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const deleteMutation = useDeleteCategory()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this category? Expenses will become uncategorized.")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">Organize your expenses</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories?.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-sm font-medium">{c.name}</span>
                {c.is_default && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Default</span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditing(c); setFormOpen(true) }}
                  disabled={c.is_default}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-30"
                  aria-label="Edit"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {!c.is_default && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        category={editing}
      />
    </div>
  )
}
"use client"

import { useState } from "react"
import { useCategories, useDeleteCategory } from "@/hooks/queries/useCategories"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tag, Plus, Pencil, Trash2, Lock } from "lucide-react"
import { CategoryForm } from "@/components/categories/CategoryForm"
import type { Category } from "@/lib/types"

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const deleteMutation = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const systemCategories = categories?.filter((c) => c.is_default) ?? []
  const customCategories = categories?.filter((c) => !c.is_default) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories?.length ?? 0} categories
        </p>
        <Button
          size="sm"
          onClick={() => { setEditCategory(null); setFormOpen(true) }}
        >
          <Plus size={16} />
          Add category
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* System categories */}
          {systemCategories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Default
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {systemCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={() => { setEditCategory(category); setFormOpen(true) }}
                    onDelete={() => setDeleteId(category.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom categories */}
          {customCategories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Custom
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {customCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={() => { setEditCategory(category); setFormOpen(true) }}
                    onDelete={() => setDeleteId(category.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {categories?.length === 0 && (
            <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
              <Tag size={40} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">No categories yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create one to organize your expenses</p>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Form */}
      <CategoryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditCategory(null) }}
        category={editCategory}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Expenses in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
        {category.is_default && (
          <Lock size={12} className="text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{category.name}</p>
        {category.is_default && (
          <Badge variant="secondary" className="text-xs mt-1">Default</Badge>
        )}
      </div>
      {!category.is_default && (
        <div className="flex items-center gap-1 mt-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
          >
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      )}
    </Card>
  )
}
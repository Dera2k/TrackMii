"use client"

import { useState, useEffect } from "react"
import { useCreateCategory, useUpdateCategory } from "@/hooks/queries/useCategories"
import { X } from "lucide-react"
import type { Category } from "@/lib/types"

const PRESET_COLORS = [
  "#e67e22", "#3498db", "#e74c3c", "#9b59b6",
  "#1abc9c", "#2ecc71", "#f39c12", "#e91e63",
  "#607d8b", "#795548", "#33471d", "#a4a494",
]

interface Props {
  open: boolean
  onClose: () => void
  category?: Category | null
}

export function CategoryForm({ open, onClose, category }: Props) {
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const isEditing = !!category

  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])

  useEffect(() => {
    if (category) { setName(category.name); setColor(category.color) }
    else { setName(""); setColor(PRESET_COLORS[0]) }
  }, [category, open])

  const handleSave = async () => {
    if (!name.trim()) return
    if (isEditing) {
      await updateMutation.mutateAsync({ id: category.id, data: { name, color } })
    } else {
      await createMutation.mutateAsync({ name, color })
    }
    onClose()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEditing ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? c : "transparent",
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-border cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : isEditing ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}
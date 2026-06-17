"use client"

import { useState } from "react"
import { useBudgets, useCurrentMonthBudgets, useDeleteBudget, useCreateBudget, useUpdateBudget } from "@/hooks/queries/useBudgets"
import { useCategories } from "@/hooks/queries/useCategories"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { Target, Trash2 } from "lucide-react"
import type { Budget } from "@/lib/types"

export default function BudgetsPage() {
  const { user } = useAuth()
  const currency = user?.currency ?? "NGN"
  const { data: budgets, isLoading } = useCurrentMonthBudgets()
  const { data: categories } = useCategories()
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const deleteMutation = useDeleteBudget()

  const [showModal, setShowModal] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")

  const now = new Date()
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" })
  const overall = budgets?.find((b) => !b.category_id)
  const categoryBudgets = budgets?.filter((b) => b.category_id) ?? []

  const handleCategoryChange = (id: string) => {
    setCategoryId(id)
    
    const existing = budgets?.find(
      b => b.category_id === (id || null) &&
           b.month === now.getMonth() + 1 &&
           b.year === now.getFullYear()
    )
    
    if (existing) {
      setEditBudget(existing)
      setAmount(existing.amount.toString())
    } else {
      setEditBudget(null)
      setAmount("")
    }
  }

  const openModal = (b?: Budget) => {
    if (b) {
      setEditBudget(b)
      setCategoryId(b.category_id ?? "")
      setAmount(b.amount.toString())
    } else {
      setEditBudget(null)
      setCategoryId("")
      setAmount("")
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!amount) return
    const amt = parseFloat(amount)
    
    if (editBudget) {
      await updateMutation.mutateAsync({
        id: editBudget.id,
        data: { amount: amt, currency: editBudget.currency },
      })
      setShowModal(false)
    } else {
      try {
        await createMutation.mutateAsync({
          category_id: categoryId || undefined,
          amount: amt,
          currency: user?.currency ?? "NGN",
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        })
        setShowModal(false)
      } catch (error: any) {
        if (error?.status === 409) {
          const existing = budgets?.find(
            b => b.category_id === (categoryId || null) &&
                 b.month === now.getMonth() + 1 &&
                 b.year === now.getFullYear()
          )
          if (existing) {
            await updateMutation.mutateAsync({
              id: existing.id,
              data: { amount: amt, currency: existing.currency }
            })
            setShowModal(false)
          }
        }
      }
    }
  }

  const handleDelete = async (budget: Budget) => {
    if (confirm("Delete this budget?")) {
      await deleteMutation.mutateAsync(budget.id)
    }
  }

  const getColor = (pct: number) => {
  const isDark = document.documentElement.classList.contains('dark')
  
  if (pct >= 100) {
    return isDark ? '#ff4444' : '#dc2626'
  } else if (pct >= 80) {
    return '#eab308'
  } else {
    return isDark ? '#5a9d1f' : '#2d5a0c'
  }
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-sm mt-1">{monthLabel}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Set Budget
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !budgets?.length ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={Target}
            title="No budgets set"
            description="Set a monthly budget to track your spending against your goals."
            action={{ label: "Set Budget", onClick: () => openModal() }}
          />
        </div>
      ) : (
        <>
          {overall && (
            <div
              className="bg-card rounded-xl border border-border p-6 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => openModal(overall)}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Overall Monthly Budget</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: getColor(overall.usage_percentage) }}>
                  {Math.round(overall.usage_percentage)}%
                </span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold">{formatCurrency(overall.spent_amount, currency)}</span>
                <span className="text-muted-foreground text-sm mb-1">/ {formatCurrency(overall.amount, currency)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overall.usage_percentage, 100)}%`, backgroundColor: getColor(overall.usage_percentage) }} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {formatCurrency(Math.max(overall.amount - overall.spent_amount, 0), currency)} remaining
              </p>
            </div>
          )}

          {categoryBudgets.length > 0 && (
            <div className="space-y-3">
              {categoryBudgets.map((b) => (
                <div key={b.id}
                  className="bg-card rounded-xl border border-border p-4 group hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => openModal(b)}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.category?.color ?? "#999" }} />
                      <span className="text-sm font-medium">{b.category?.name ?? "Category"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{Math.round(b.usage_percentage)}%</span>
                      <button
                        onClick={() => handleDelete(b)}
                        disabled={deleteMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(b.usage_percentage, 100)}%`, backgroundColor: getColor(b.usage_percentage) }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{formatCurrency(b.spent_amount, currency)} spent</span>
                    <span>{formatCurrency(b.amount, currency)} budget</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editBudget ? "Edit Budget" : "Set Budget"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={!!editBudget}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">Overall Budget</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Enter budget amount"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
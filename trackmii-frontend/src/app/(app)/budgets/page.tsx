"use client"

import { useState } from "react"
import { useBudgets, useDeleteBudget } from "@/hooks/queries/useBudgets"
import { useCategories } from "@/hooks/queries/useCategories"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCreateBudget, useUpdateBudget } from "@/hooks/queries/useBudgets"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { Target } from "lucide-react"
import type { Budget } from "@/lib/types"

export default function BudgetsPage() {
  const { user } = useAuth()
  const currency = user?.currency ?? "NGN"
  const { data: budgets, isLoading } = useBudgets()
  const { data: categories } = useCategories()
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()

  const [showModal, setShowModal] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")

  const now = new Date()
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" })
  const overall = budgets?.find((b) => !b.category_id)
  const categoryBudgets = budgets?.filter((b) => b.category_id) ?? []

  const openSet = (b?: Budget) => {
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
    } else {
      await createMutation.mutateAsync({
        category_id: categoryId || undefined,
        amount: amt,
        currency: user?.currency ?? "NGN",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      })
    }
    setShowModal(false)
  }

  const getColor = (pct: number) =>
    pct >= 100 ? "hsl(var(--destructive))" : pct >= 80 ? "#eab308" : "hsl(var(--primary))"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-sm mt-1">{monthLabel}</p>
        </div>
        <button
          onClick={() => openSet()}
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
            action={{ label: "Set Budget", onClick: () => openSet() }}
          />
        </div>
      ) : (
        <>
          {overall && (
            <div
              className="bg-card rounded-xl border border-border p-6 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => openSet(overall)}
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
                  className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => openSet(b)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.category?.color ?? "#999" }} />
                      <span className="text-sm font-medium">{b.category?.name ?? "Category"}</span>
                    </div>
                    <span className="text-sm font-bold">{Math.round(b.usage_percentage)}%</span>
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
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!!editBudget}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">Overall Budget</option>
                  {categories?.filter((c) => !c.is_default).map((c) => (
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
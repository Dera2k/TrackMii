"use client"

import { useState } from "react"
import { useBudgets, useDeleteBudget } from "@/hooks/queries/useBudgets"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { PiggyBank, Plus, Pencil, Trash2 } from "lucide-react"
import { BudgetForm } from "@/components/budgets/BudgetForm"
import type { Budget } from "@/lib/types"

export default function BudgetsPage() {
  const { user } = useAuth()
  const { data: budgets, isLoading } = useBudgets()
  const deleteMutation = useDeleteBudget()

  const [formOpen, setFormOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const currency = user?.currency ?? "NGN"

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{currentMonth}</p>
        <Button
          size="sm"
          onClick={() => { setEditBudget(null); setFormOpen(true) }}
        >
          <Plus size={16} />
          Add budget
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : budgets?.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <PiggyBank size={40} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">No budgets set</p>
            <p className="text-xs text-muted-foreground mt-1">
              Set a budget to track your spending limits
            </p>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Create budget
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets?.map((budget) => {
            const pct = Math.min(budget.usage_percentage, 100)
            const over = budget.usage_percentage >= 100
            const warning = budget.usage_percentage >= 80 && !over
            const remaining = budget.amount - budget.spent_amount

            return (
              <Card key={budget.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {budget.category && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${budget.category.color}20` }}
                      >
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: budget.category.color }}
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {budget.category?.name ?? "Overall Budget"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(0, budget.month - 1).toLocaleString("default", { month: "long" })} {budget.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={over ? "destructive" : warning ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      {over ? "Over" : warning ? "Warning" : "On track"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditBudget(budget); setFormOpen(true) }}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(budget.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress
                    value={pct}
                    className={`h-2 ${over ? "[&>div]:bg-destructive" : warning ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary"}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(budget.spent_amount, currency)} spent</span>
                    <span>
                      {over
                        ? `${formatCurrency(Math.abs(remaining), currency)} over`
                        : `${formatCurrency(remaining, currency)} left`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    of {formatCurrency(budget.amount, currency)}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditBudget(null) }}
        budget={editBudget}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget?</AlertDialogTitle>
            <AlertDialogDescription>
              Your expense history will not be affected.
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
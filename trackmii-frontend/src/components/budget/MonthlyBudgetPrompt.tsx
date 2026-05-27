"use client"

import { useRouter } from "next/navigation"
import { Target } from "lucide-react"
import { useBudgetReminder } from "@/hooks/queries/useBudgetReminder"

export function MonthlyBudgetPrompt() {
  const router = useRouter()
  const { needsReminder, dismiss } = useBudgetReminder()

  if (!needsReminder) return null

  const monthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" })

  const handleSetBudget = () => {
    dismiss()
    router.push("/budgets")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-center mb-1">New Month, New Budget</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Would you like to set a budget for {monthLabel}?
        </p>
        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSetBudget}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Set Budget
          </button>
        </div>
      </div>
    </div>
  )
}
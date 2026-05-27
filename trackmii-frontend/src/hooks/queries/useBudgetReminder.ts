"use client"

import { useState, useEffect } from "react"
import { useCurrentMonthBudgets } from "@/hooks/queries/useBudgets"

export function useBudgetReminder() {
  const { data: budgets, isLoading } = useCurrentMonthBudgets()
  const [dismissed, setDismissed] = useState(true)

  const now = new Date()
  const monthKey = `budget-prompt-${now.getFullYear()}-${now.getMonth() + 1}`

  useEffect(() => {
    const isDismissed = localStorage.getItem(monthKey) === "true"
    setDismissed(isDismissed)
  }, [monthKey])

  const hasOverallBudget = budgets?.some((b) => !b.category_id && b.amount > 0) ?? true
  const needsReminder = !isLoading && !hasOverallBudget && !dismissed

  const dismiss = () => {
    localStorage.setItem(monthKey, "true")
    setDismissed(true)
  }

  return { needsReminder, dismiss }
}
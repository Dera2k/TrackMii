import { AppLayout } from "@/components/layout/AppLayout"
import { MonthlyBudgetPrompt } from "@/components/budget/MonthlyBudgetPrompt"

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout>
      <MonthlyBudgetPrompt />
      {children}
    </AppLayout>
  )
}
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useDashboardStats } from "@/hooks/queries/useAnalytics"
import { useExpenses } from "@/hooks/queries/useExpenses"
import { useCurrentMonthBudgets } from "@/hooks/queries/useBudgets"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Wallet, Target, PieChart as PieIcon, Receipt } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { EmptyState } from "@/components/common/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const currency = user?.currency ?? "NGN"

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: expensesData, isLoading: expensesLoading } = useExpenses({ limit: 6 })
  const { data: budgets, isLoading: budgetsLoading } = useCurrentMonthBudgets()

  const overall = budgets?.find((b) => !b.category_id)
  const budgetPct = overall ? Math.round(overall.usage_percentage) : 0
  const budgetStatus = budgetPct >= 100 ? "hsl(var(--destructive))" : budgetPct >= 80 ? "#eab308" : "hsl(var(--primary))"

  const monthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" })

  const isLoading = statsLoading || expensesLoading || budgetsLoading
  const hasData = (expensesData?.data?.length ?? 0) > 0 || (budgets?.length ?? 0) > 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your financial overview</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your financial overview</p>
        </div>
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={Wallet}
            title="Nothing to show yet"
            description="Add your first expense or set a budget to start seeing your financial overview here."
            action={{ label: "Add Expense", onClick: () => router.push("/expenses?add=true") }}
          />
        </div>
      </div>
    )
  }

  const recent = expensesData?.data ?? []

  const chartData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {}
    for (const e of recent) {
      const key = e.category?.name ?? "Uncategorized"
      if (!map[key]) map[key] = { name: key, value: 0, color: e.category?.color ?? "#999" }
      map[key].value += e.amount
    }
    return Object.values(map)
  }, [recent])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your financial overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Wallet className="w-5 h-5" /><span className="text-sm">Total Spent</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats?.total_spent_all_time ?? 0, currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-5 h-5" /><span className="text-sm">This Month</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats?.current_month_spent ?? 0, currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">{monthLabel}</p>
        </div>

        {overall ? (
          <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-muted" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
                  strokeDasharray={`${Math.min(budgetPct, 100)} ${100 - Math.min(budgetPct, 100)}`}
                  strokeLinecap="round"
                  style={{ stroke: budgetStatus }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{budgetPct}%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-lg font-bold">{formatCurrency(overall.spent_amount, currency)}</p>
              <p className="text-xs text-muted-foreground">of {formatCurrency(overall.amount, currency)}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/budgets")}
            className="bg-card rounded-xl border border-dashed border-border p-5 flex items-center justify-center text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <Target className="w-4 h-4 mr-2" /> Set a monthly budget
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category chart */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold mb-4">Spending by Category</h2>
          {chartData.length === 0 ? (
            <EmptyState icon={PieIcon} title="No spending yet" description="Categorized expenses will appear here." />
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {chartData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(d.value, currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent expenses */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Expenses</h2>
            {recent.length > 0 && <Link href="/expenses" className="text-xs text-primary hover:underline">View All</Link>}
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Your most recent transactions will show up here."
              action={{ label: "Add Expense", onClick: () => router.push("/expenses?add=true") }}
            />
          ) : (
            <div className="space-y-3">
              {recent.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.category?.color ?? "#999" }} />
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.category?.name ?? "Uncategorized"} · {e.expense_date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(e.amount, e.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {overall && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-3">Budget Health</h2>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: budgetStatus }} />
            <span className="text-sm">
              {budgetPct < 80 ? "You're on track! Spending is under control."
                : budgetPct < 100 ? "Heads up — approaching budget limit."
                : "Budget exceeded! Review spending."}
            </span>
            <Target className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
        </div>
      )}
    </div>
  )
}
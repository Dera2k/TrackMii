"use client"

import { useDashboardStats } from "@/hooks/queries/useAnalytics"
import { useExpenses } from "@/hooks/queries/useExpenses"
import { useCurrentMonthBudgets } from "@/hooks/queries/useBudgets"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  Tag,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: expensesData, isLoading: expensesLoading } = useExpenses({ limit: 5 })
  const { data: budgets, isLoading: budgetsLoading } = useCurrentMonthBudgets()

  const currency = user?.currency ?? "NGN"

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your money.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Spent this month"
          value={statsLoading ? null : formatCurrency(stats?.current_month_spent ?? 0, currency)}
          icon={<TrendingUp size={16} />}
          loading={statsLoading}
        />
        <StatCard
          label="All time"
          value={statsLoading ? null : formatCurrency(stats?.total_spent_all_time ?? 0, currency)}
          icon={<Receipt size={16} />}
          loading={statsLoading}
        />
        <StatCard
          label="Budget left"
          value={
            statsLoading
              ? null
              : stats?.current_month_budget
              ? formatCurrency(
                  stats.current_month_budget - (stats.current_month_spent ?? 0),
                  currency
                )
              : "No budget"
          }
          icon={<PiggyBank size={16} />}
          loading={statsLoading}
        />
        <StatCard
          label="Top category"
          value={statsLoading ? null : stats?.top_category?.name ?? "None"}
          icon={<Tag size={16} />}
          loading={statsLoading}
        />
      </div>

      {/* Budget Progress */}
      {!budgetsLoading && budgets && budgets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Budget Overview</h3>
            <Link
              href="/budgets"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {budgets.slice(0, 3).map((budget) => {
              const pct = Math.min(budget.usage_percentage, 100)
              const over = budget.usage_percentage >= 100
              const warning = budget.usage_percentage >= 80 && !over
              return (
                <Card key={budget.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {budget.category && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: budget.category.color }}
                        />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {budget.category?.name ?? "Overall"}
                      </span>
                    </div>
                    <Badge
                      variant={over ? "destructive" : warning ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      {over ? "Over budget" : warning ? "Almost there" : `${Math.round(pct)}%`}
                    </Badge>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-1.5 ${over ? "[&>div]:bg-destructive" : warning ? "[&>div]:bg-yellow-500" : ""}`}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(budget.spent_amount, currency)} spent
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(budget.amount, currency)}
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Expenses</h3>
          <Link
            href="/expenses"
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        {expensesLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : expensesData?.data.length === 0 ? (
          <Card className="p-8 flex flex-col items-center justify-center text-center gap-2">
            <Receipt size={32} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
            <Link href="/expenses?add=true" className="text-xs text-primary hover:underline">
              Add your first expense
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {expensesData?.data.map((expense) => (
              <Card key={expense.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: expense.category?.color
                        ? `${expense.category.color}20`
                        : "hsl(var(--muted))",
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: expense.category?.color ?? "hsl(var(--muted-foreground))",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{expense.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category?.name ?? "Uncategorized"} · {formatDate(expense.expense_date)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string
  value: string | null
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium truncate">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <p className="text-lg font-bold text-foreground truncate">{value}</p>
      )}
    </Card>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
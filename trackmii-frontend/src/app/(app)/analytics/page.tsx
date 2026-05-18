"use client"

import { useState } from "react"
import { useCategoryBreakdown, useMonthlyTrends, useWeeklyTrends, useDashboardStats } from "@/hooks/queries/useAnalytics"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { BarChart3 } from "lucide-react"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

const periods = ["This Week", "This Month", "Last 30 Days"] as const
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const chartColors = [
  "hsl(var(--primary))",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
]

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}m`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return `${value}`
}

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">
        {formatCurrency(Number(payload[0].value ?? 0), currency)}
      </p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const currency = user?.currency ?? "NGN"
  const [period, setPeriod] = useState("This Month")

  const { data: stats } = useDashboardStats()
  const { data: breakdownRes, isLoading: breakdownLoading } = useCategoryBreakdown()
  const { data: monthlyRes, isLoading: monthlyLoading } = useMonthlyTrends(6)
  const { data: weeklyRes, isLoading: weeklyLoading } = useWeeklyTrends(8)

  const breakdown = Array.isArray(breakdownRes?.data) ? breakdownRes.data : []
  const monthly = Array.isArray(monthlyRes?.data) ? monthlyRes.data : []
  const weekly = Array.isArray(weeklyRes?.data) ? weeklyRes.data : []

  const totalSpent = breakdown.reduce((s, d) => s + d.amount, 0)

  const avgDaily = stats?.current_month_spent
    ? Math.round(stats.current_month_spent / new Date().getDate())
    : 0

  const monthlyChartData = monthly.map((m) => ({
    month: monthNames[m.month - 1],
    amount: m.total_spent,
  }))

  const weeklyChartData = weekly.map((w, index) => ({
    week: `Week ${index + 1}`,
    amount: w.total_spent,
  }))

  const hasMonthly = monthlyChartData.some((m) => m.amount > 0)
  const hasWeekly = weeklyChartData.some((w) => w.amount > 0)

  if (!breakdownLoading && !breakdown.length && !monthly.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Understand your spending patterns</p>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={BarChart3}
            title="No data to analyze"
            description="Once you start adding expenses, charts and trends will appear here."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Understand your spending patterns</p>
      </div>

      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
        <div className="bg-card rounded-xl border border-border p-4 min-w-0">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(totalSpent, currency)}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 min-w-0">
          <p className="text-xs text-muted-foreground">Avg Daily</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(avgDaily, currency)}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 min-w-0">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-lg font-bold mt-1">{stats?.transaction_count ?? 0}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 min-w-0">
          <p className="text-xs text-muted-foreground">Top Category</p>
          <p className="text-lg font-bold mt-1 truncate">{breakdown[0]?.category_name?.split(" ")[0] ?? "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div className="bg-card rounded-xl border border-border p-5 min-w-0">
          <h2 className="text-sm font-semibold mb-4">Monthly Spending Trend</h2>

          {monthlyLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : hasMonthly ? (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompactNumber(Number(v))} width={42} />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                  <Line type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="Not enough history" description="Trends appear once you log expenses across multiple months." />
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 min-w-0">
          <h2 className="text-sm font-semibold mb-4">Weekly Spending</h2>

          {weeklyLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : hasWeekly ? (
            <div className="h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompactNumber(Number(v))} width={42} />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                  <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="No weekly data" description="Recent weekly spending will show here." />
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 min-w-0 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4">Category Breakdown</h2>

          {breakdownLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : !breakdown.length ? (
            <EmptyState icon={BarChart3} title="No categorized spending" description="Add expenses to see a breakdown." />
          ) : (
            <>
              <div className="h-48 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="amount" paddingAngle={3} strokeWidth={0}>
                      {breakdown.map((d, i) => <Cell key={d.category_id} fill={d.color || chartColors[i % chartColors.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip currency={currency} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2">
                {breakdown.map((d, i) => (
                  <div key={d.category_id} className="flex items-center justify-between text-sm min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color || chartColors[i % chartColors.length] }} />
                      <span className="text-muted-foreground truncate">{d.category_name}</span>
                    </div>
                    <span className="font-medium shrink-0">{formatCurrency(d.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

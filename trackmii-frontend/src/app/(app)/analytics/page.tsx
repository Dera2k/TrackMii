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
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"

const periods = ["This Week", "This Month", "Last 30 Days"] as const
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function AnalyticsPage() {
  const { user } = useAuth()
  const currency = user?.currency ?? "NGN"
  const [period, setPeriod] = useState("This Month")

  const { data: stats } = useDashboardStats()
  const { data: breakdown, isLoading: breakdownLoading } = useCategoryBreakdown()
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyTrends(6)
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyTrends(8)

  const totalSpent = breakdown?.reduce((s, d) => s + d.total, 0) ?? 0
  const avgDaily = stats?.current_month_spent
    ? Math.round(stats.current_month_spent / new Date().getDate())
    : 0

  const monthlyChartData = monthly?.map((m) => ({
    month: monthNames[m.month - 1],
    amount: m.total,
  })) ?? []

  const weeklyChartData = weekly?.map((w) => ({
    week: `W${w.week}`,
    amount: w.total,
  })) ?? []

  const hasMonthly = monthlyChartData.some((m) => m.amount > 0)
  const hasWeekly = weeklyChartData.some((w) => w.amount > 0)

  if (!breakdownLoading && !breakdown?.length && !monthly?.length) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Understand your spending patterns</p>
      </div>

      <div className="flex gap-2">
        {periods.map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(totalSpent, currency)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Avg Daily</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(avgDaily, currency)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-lg font-bold mt-1">{stats?.transaction_count ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Top Category</p>
          <p className="text-lg font-bold mt-1 truncate">{breakdown?.[0]?.category_name?.split(" ")[0] ?? "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Monthly Spending Trend</h2>
          {monthlyLoading ? <Skeleton className="h-64 w-full rounded-xl" /> : hasMonthly ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v, currency), "Spent"]} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="Not enough history" description="Trends appear once you log expenses across multiple months." />
          )}
        </div>

        {/* Weekly */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Weekly Spending</h2>
          {weeklyLoading ? <Skeleton className="h-64 w-full rounded-xl" /> : hasWeekly ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v, currency), "Spent"]} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title="No weekly data" description="Recent weekly spending will show here." />
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Category Breakdown</h2>
          {breakdownLoading ? <Skeleton className="h-48 w-full rounded-xl" /> : !breakdown?.length ? (
            <EmptyState icon={BarChart3} title="No categorized spending" description="Add expenses to see a breakdown." />
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="total" paddingAngle={3} strokeWidth={0}>
                      {breakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCurrency(v, currency), ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {breakdown.map((d) => (
                  <div key={d.category_id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.category_name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(d.total, currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top categories */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold mb-4">Top Spending Categories</h2>
          {breakdownLoading ? <Skeleton className="h-48 w-full rounded-xl" /> : !breakdown?.length ? (
            <EmptyState icon={BarChart3} title="Nothing to rank yet" description="Top categories will appear once you log expenses." />
          ) : (
            <div className="space-y-4">
              {breakdown.map((d, i) => {
                const pct = totalSpent > 0 ? Math.round((d.total / totalSpent) * 100) : 0
                return (
                  <div key={d.category_id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium w-5">#{i + 1}</span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span>{d.category_name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(d.total, currency)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden ml-7">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
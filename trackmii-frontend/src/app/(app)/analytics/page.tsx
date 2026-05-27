"use client"

import { useState, useMemo } from "react"
import { useCategoryBreakdown, useMonthlyTrends, useWeeklyTrends } from "@/hooks/queries/useAnalytics"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { BarChart3, Calendar } from "lucide-react"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

const periods = ["This Week", "This Month", "Last 30 Days", "Custom"] as const
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
      <p className="text-sm font-semibold">{formatCurrency(Number(payload[0].value ?? 0), currency)}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const currency = user?.currency ?? "NGN"
  const [period, setPeriod] = useState<typeof periods[number]>("This Month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const dateRange = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (period === "Custom" && startDate && endDate) {
      return {
        start_date: startDate,
        end_date: endDate,
        weeks: 8,
        months: 6,
      }
    }

    if (period === "This Week") {
      const dayOfWeek = startOfToday.getDay()
      const start = new Date(startOfToday)
      start.setDate(start.getDate() - dayOfWeek)
      return {
        start_date: start.toISOString().split("T")[0],
        end_date: startOfToday.toISOString().split("T")[0],
        weeks: 1,
        months: 1,
      }
    }

    if (period === "This Month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        start_date: start.toISOString().split("T")[0],
        end_date: startOfToday.toISOString().split("T")[0],
        weeks: 5,
        months: 1,
      }
    }

    if (period === "Last 30 Days") {
      const start = new Date(startOfToday)
      start.setDate(start.getDate() - 30)
      return {
        start_date: start.toISOString().split("T")[0],
        end_date: startOfToday.toISOString().split("T")[0],
        weeks: 5,
        months: 2,
      }
    }

    return { start_date: "", end_date: "", weeks: 8, months: 6 }
  }, [period, startDate, endDate])

  const { data: breakdownRes, isLoading: breakdownLoading } = useCategoryBreakdown({
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
  })
  const { data: monthlyRes, isLoading: monthlyLoading } = useMonthlyTrends(dateRange.months)
  const { data: weeklyRes, isLoading: weeklyLoading } = useWeeklyTrends(dateRange.weeks)

  const breakdown = Array.isArray(breakdownRes?.data) ? breakdownRes.data : []
  const monthly = Array.isArray(monthlyRes?.data) ? monthlyRes.data : []
  const weekly = Array.isArray(weeklyRes?.data) ? weeklyRes.data : []

  const totalSpent = breakdown.reduce((s, d) => s + d.amount, 0)
  const avgDaily = breakdown.length && dateRange.start_date
    ? Math.round(totalSpent / ((new Date(dateRange.end_date).getTime() - new Date(dateRange.start_date).getTime()) / (1000 * 60 * 60 * 24) + 1))
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
          <EmptyState icon={BarChart3} title="No data to analyze" description="Once you start adding expenses, charts and trends will appear here." />
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

      {/* Filter Controls */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
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

        {/* Quick Action: Month Selector */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Jump to month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => {
              const month = parseInt(e.target.value)
              setSelectedMonth(month)
              const start = new Date(selectedYear, month, 1)
              const end = new Date(selectedYear, month + 1, 0)
              setPeriod("Custom")
              setStartDate(start.toISOString().split("T")[0])
              setEndDate(end.toISOString().split("T")[0])
            }}
            className="px-2 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none"
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => {
              const year = parseInt(e.target.value)
              setSelectedYear(year)
              const start = new Date(year, selectedMonth, 1)
              const end = new Date(year, selectedMonth + 1, 0)
              setPeriod("Custom")
              setStartDate(start.toISOString().split("T")[0])
              setEndDate(end.toISOString().split("T")[0])
            }}
            className="px-2 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {period === "Custom" && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={() => setPeriod("This Month")}
              className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-accent transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
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
          <p className="text-lg font-bold mt-1">{breakdown.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 min-w-0">
          <p className="text-xs text-muted-foreground">Top Category</p>
          <p className="text-lg font-bold mt-1 truncate">{breakdown[0]?.category_name?.split(" ")[0] ?? "—"}</p>
        </div>
      </div>

      {/* Charts */}
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
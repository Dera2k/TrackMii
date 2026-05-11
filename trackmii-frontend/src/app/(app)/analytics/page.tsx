"use client"

import { useState } from "react"
import { useCategoryBreakdown, useMonthlyTrends, useWeeklyTrends } from "@/hooks/queries/useAnalytics"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const currency = user?.currency ?? "NGN"

  const { data: breakdown, isLoading: breakdownLoading } = useCategoryBreakdown()
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyTrends(6)
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyTrends(8)

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const monthlyChartData = monthly?.map((m) => ({
    name: `${monthNames[m.month - 1]} ${m.year}`,
    total: m.total,
  })) ?? []

  const weeklyChartData = weekly?.map((w) => ({
    name: `W${w.week}`,
    total: w.total,
  })) ?? []

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
        </TabsList>

        {/* Overview — Category Breakdown */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {breakdownLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : breakdown && breakdown.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={breakdown}
                        dataKey="total"
                        nameKey="category_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                      >
                        {breakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value, currency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {breakdown.map((item) => (
                  <Card key={item.category_id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-foreground flex-1">{item.category_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(item.percentage)}%
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.total, currency)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No data yet</p>
            </Card>
          )}
        </TabsContent>

        {/* Monthly Bar Chart */}
        <TabsContent value="monthly" className="mt-4">
          {monthlyLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last 6 Months</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v, currency)} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Weekly Line Chart */}
        <TabsContent value="weekly" className="mt-4">
          {weeklyLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last 8 Weeks</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={weeklyChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v, currency)} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useExpenses, useDeleteExpense } from "@/hooks/queries/useExpenses"
import { useCategories } from "@/hooks/queries/useCategories"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { Search, SlidersHorizontal, Pencil, Trash2, Receipt } from "lucide-react"
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal"
import { EmptyState } from "@/components/common/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import type { Expense } from "@/lib/types"

export default function ExpensesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const page = Number(searchParams.get("page") ?? "1")
  const search = searchParams.get("search") ?? ""
  const categoryId = searchParams.get("category") ?? ""
  const paymentMethod = searchParams.get("method") ?? ""

  const [showFilters, setShowFilters] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const showModal = searchParams.get("add") === "true" || !!editingExpense

  const { data, isLoading } = useExpenses({
    page,
    limit: 20,
    search: search || undefined,
    category_id: categoryId || undefined,
    payment_method: paymentMethod || undefined,
  })
  const { data: categories } = useCategories()
  const deleteMutation = useDeleteExpense()

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k))

    //reset to page 1 if not update page directly
    if (!updates.page) {
      params.set("page", "1")
    }
    router.push(`/expenses?${params.toString()}`)
  }

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("add")
    router.push(`/expenses?${params.toString()}`)
    setEditingExpense(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this expense?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const expenses = data?.data ?? []
  const total = data?.meta?.total ?? 0
  const totalPages = data?.meta?.totalPages ?? 1

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    const halfVisible = Math.floor(maxVisible / 2)

    let startPage = Math.max(1, page - halfVisible)
    let endPage = Math.min(totalPages, page + halfVisible)

    if (endPage - startPage < maxVisible - 1) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisible - 1)
      } else {
        startPage = Math.max(1, endPage - maxVisible + 1)
      }
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push("...")
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...")
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? "Loading..." : `${total} ${total === 1 ? "transaction" : "transactions"}`}
          </p>
        </div>
        <button
          onClick={() => router.push("/expenses?add=true")}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Expense
        </button>
      </div>

      {/* Search & filters */}
      {(expenses.length > 0 || search || categoryId || paymentMethod) && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search expenses..."
              defaultValue={search}
              onChange={(e) => updateParams({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm hover:bg-accent transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      )}

      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={categoryId}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none"
          >
            <option value="">All categories</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={paymentMethod}
            onChange={(e) => updateParams({ method: e.target.value })}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none"
          >
            <option value="">All methods</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : expenses.length === 0 && !search ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Add your first expense to start tracking your spending."
            action={{ label: "Add Expense", onClick: () => router.push("/expenses?add=true") }}
          />
        </div>
      ) : expenses.length === 0 && search ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            icon={Search}
            title="No matches"
            description={`Nothing matches "${search}".`}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.category?.color ?? "#999" }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.category?.name ?? "Uncategorized"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{e.title}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{e.expense_date}</span>
                  </div>
                  {e.note && <p className="text-xs text-muted-foreground mt-1 truncate">{e.note}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-sm font-bold">{formatCurrency(e.amount, e.currency)}</span>
                <button onClick={() => setEditingExpense(e)} className="p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Edit">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" aria-label="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
            className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
          >
            Previous
          </button>

          {getPageNumbers().map((p, i) => (
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <button
                key={p}
                onClick={() => updateParams({ page: String(p) })}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-accent'
                }`}
              >
                {p}
              </button>
            )
          ))}

          <button
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <AddExpenseModal open={showModal} onClose={closeModal} expense={editingExpense} />
      )}
    </div>
  )
}
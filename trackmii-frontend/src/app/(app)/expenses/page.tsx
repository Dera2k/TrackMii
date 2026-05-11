"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useExpenses } from "@/hooks/queries/useExpenses"
import { useCategories } from "@/hooks/queries/useCategories"
import { useDeleteExpense } from "@/hooks/queries/useExpenses"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Trash2, Pencil, Receipt, ChevronLeft, ChevronRight } from "lucide-react"
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal"
import type { Expense } from "@/lib/types"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"

export default function ExpensesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories } = useCategories()
  const { data, isLoading } = useExpenses({
    page,
    limit: 20,
    search: search || undefined,
    category_id: categoryId || undefined,
    payment_method: paymentMethod || undefined,
  })
  const deleteMutation = useDeleteExpense()

  // Open modal from FAB (?add=true)
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setModalOpen(true)
      router.replace("/expenses")
    }
  }, [searchParams, router])

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={categoryId}
            onValueChange={(v) => { setCategoryId(v === "all" ? "" : v); setPage(1) }}
          >
            <SelectTrigger className="flex-1 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={paymentMethod}
            onValueChange={(v) => { setPaymentMethod(v === "all" ? "" : v); setPage(1) }}
          >
            <SelectTrigger className="flex-1 text-sm">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && data && (
        <p className="text-xs text-muted-foreground">
          {data.meta.total} expense{data.meta.total !== 1 ? "s" : ""}
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <Receipt size={40} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">No expenses found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || categoryId || paymentMethod
                ? "Try adjusting your filters"
                : "Tap + to add your first expense"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {data?.data.map((expense) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: expense.category?.color
                      ? `${expense.category.color}20`
                      : "hsl(var(--muted))",
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        expense.category?.color ?? "hsl(var(--muted-foreground))",
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{expense.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(expense.expense_date)}
                    </span>
                    {expense.category && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {expense.category.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {PAYMENT_METHOD_LABELS[expense.payment_method]}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditExpense(expense); setModalOpen(true) }}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(expense.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!data.meta.hasPreviousPage}
          >
            <ChevronLeft size={16} />
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.meta.hasNextPage}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditExpense(null) }}
        expense={editExpense}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
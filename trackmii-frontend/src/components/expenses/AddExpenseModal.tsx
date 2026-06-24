"use client"

import { useState, useEffect } from "react"
import { useCreateExpense, useUpdateExpense } from "@/hooks/queries/useExpenses"
import { useCategories } from "@/hooks/queries/useCategories"
import { useAuth } from "@/lib/contexts/auth-context"
import { CURRENCY_SYMBOLS, PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { formatDateInput } from "@/lib/utils"
import { X } from "lucide-react"
import type { Expense, PaymentMethod, Currency } from "@/lib/types"

interface Props {
  open: boolean
  onClose: () => void
  expense?: Expense | null
}

export function AddExpenseModal({ open, onClose, expense }: Props) {
  const { user } = useAuth()
  const { data: categories } = useCategories()
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>(user?.currency ?? "NGN")
  const [categoryId, setCategoryId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [date, setDate] = useState(formatDateInput(new Date()))
  const [note, setNote] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (expense) {
      setTitle(expense.title)
      setAmount(expense.amount.toString())
      setCurrency(expense.currency)
      setCategoryId(expense.category?.id ?? "")
      setPaymentMethod(expense.payment_method)
      setDate(expense.expense_date)
      setNote(expense.note ?? "")
    } else {
      setTitle("")
      setAmount("")
      setCurrency(user?.currency ?? "NGN")
      setCategoryId("")
      setPaymentMethod("CASH")
      setDate(formatDateInput(new Date()))
      setNote("")
    }
    setErrors({})
  }, [expense, open, user])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = "Title is required"
    if (!amount || parseFloat(amount) <= 0) e.amount = "Enter a valid amount"
    if (!categoryId) e.category = "Category is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const payload = {
      title,
      amount: parseFloat(amount),
      currency,
      category_id: categoryId || null,
      payment_method: paymentMethod,
      expense_date: date,
      note: note || undefined,
    }

    if (expense) {
      await updateMutation.mutateAsync({
        id: expense.id,
        data: payload,
      })
    } else {
      await createMutation.mutateAsync(payload)
    }

    onClose()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-2xl md:rounded-2xl border border-border p-6 w-full max-w-lg mx-0 md:mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">
            {expense ? "Edit Expense" : "Add Expense"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Title" error={errors.title}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="What did you spend on?"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" error={errors.amount}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="0.00"
              />
            </Field>

            <Field label="Currency">
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as Currency)
                }
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {Object.entries(CURRENCY_SYMBOLS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} {k}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Category" error={errors.category}>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="">Select a category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Payment Method">
            <div className="flex gap-2 flex-wrap">
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(k as PaymentMethod)
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    paymentMethod === k
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </Field>

          <Field label="Note (optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
              placeholder="Add a note..."
            />
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending
              ? "Saving..."
              : expense
              ? "Save changes"
              : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/lib/contexts/auth-context"
import type { Currency } from "@/lib/types"

interface CurrencyDisplayProps {
  amount: number
  currency?: Currency
  className?: string
}

export function CurrencyDisplay({ amount, currency, className }: CurrencyDisplayProps) {
  const { user } = useAuth()
  const resolved = currency ?? user?.currency ?? "NGN"

  return (
    <span className={className}>
      {formatCurrency(amount, resolved)}
    </span>
  )
}
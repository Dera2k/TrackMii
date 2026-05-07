import type { Currency, PaymentMethod } from "./types"

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  MOBILE_MONEY: "Mobile Money",
  OTHER: "Other",
}

export const DEFAULT_CURRENCY: Currency = "NGN"
export const DEFAULT_PAGE_LIMIT = 20
export const NOTIFICATION_POLL_INTERVAL = 30_000
export type Currency = "NGN" | "USD" | "GBP"
export type PaymentMethod = 
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "OTHER"

export type NotificationType =
  | "BUDGET_WARNING"
  | "BUDGET_EXCEEDED"
  | "WEEKLY_SUMMARY"
  | "MONTHLY_REPORT"

export interface User {
  id: string
  name: string
  email: string
  currency: Currency
  timezone: string
  dark_mode: boolean
  is_email_verified: boolean
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
  message: string
}

export interface Category {
  id: string
  name: string
  color: string
  is_default: boolean
  user_id: string | null
}

export interface Expense {
  id: string
  title: string
  amount: number
  currency: Currency
  payment_method: PaymentMethod
  expense_date: string
  note: string | null
  created_at: string
  updated_at: string
  category: Pick<Category, "id" | "name" | "color"> | null
}

export interface Budget {
  id: string
  amount: number
  currency: Currency
  month: number
  year: number
  spent_amount: number
  usage_percentage: number
  category_id: string | null
  category: Pick<Category, "id" | "name" | "color"> | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

//mirrors the backend response DTOs exactly so there are no type mismatches when consuming the API.
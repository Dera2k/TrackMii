"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { login, register, forgotPassword, resetPassword } from "@/lib/api/auth"
import { clearToken } from "@/lib/auth"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "sonner"
import type { ApiError } from "@/lib/api/client"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if ("errors" in error && Array.isArray((error as any).errors)) {
      return (error as any).errors[0] || error.message
    }
    return error.message
  }
  return "Something went wrong"
}

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.name}`)
  // wait a tick for cookie to be set then redirect
    setTimeout(() => {
      router.push("/dashboard")
    }, 100)
},
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      toast.success("Account created successfully")
      router.push("/login")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset link sent to your email")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully")
      router.push("/login")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useLogout() {
  const { logout } = useAuth()
  const queryClient = useQueryClient()

  return () => {
    clearToken()
    queryClient.clear()
    logout()
  }
}
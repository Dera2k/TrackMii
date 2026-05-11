"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { login, register, forgotPassword, resetPassword } from "@/lib/api/auth"
import { clearToken } from "@/lib/auth"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "sonner"

export function useLogin() {
  const { setUser } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.setQueryData(["auth", "me"], data.user)
      toast.success(`Welcome back, ${data.user.name}`)
      router.push("/")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useRegister() {
  const { setUser } = useAuth()
  const router = useRouter()

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setUser(data.user)
      toast.success("Account created successfully")
      router.push("/")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      toast.success("Password reset link sent to your email")
    },
    onError: (error: Error) => {
      toast.error(error.message)
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
    onError: (error: Error) => {
      toast.error(error.message)
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
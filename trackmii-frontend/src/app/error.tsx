"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
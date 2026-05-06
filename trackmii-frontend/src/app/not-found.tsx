import Link from "next/link"
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground text-center">This page doesn't exist.</p>
      <Link href="/" className="text-primary underline underline-offset-4">
        Go home
      </Link>
    </div>
  )
}
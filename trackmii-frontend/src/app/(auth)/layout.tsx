import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Trackmii</span>
          </Link>
          <p className="text-sm text-muted-foreground">Smart expense tracking</p>
        </div>
        {children}
      </div>
    </div>
  )
}

//Minimal centered layout for all auth pages (login, register, forgot password, reset password). No sidebar, no topbar. Max width 384px, vertically centered.
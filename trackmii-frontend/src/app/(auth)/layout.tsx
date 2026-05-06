export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}

//Minimal centered layout for all auth pages (login, register, forgot password, reset password). No sidebar, no topbar. Max width 384px, vertically centered.
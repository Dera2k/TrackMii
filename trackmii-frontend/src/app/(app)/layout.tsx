import { AppLayout } from "@/components/layout/AppLayout"

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}

//Wraps all authenticated pages with the full app shell. Every page inside (app)/ gets the sidebar, topbar, bottom nav, and FAB automatically.
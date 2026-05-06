"use client"

import { useState } from "react"
import { AppSidebar } from "./AppSidebar"
import { TopBar } from "./TopBar"
import { MobileNav } from "./MobileNav"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import Link from "next/link"
import { Plus } from "lucide-react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-background flex">

      {/* Desktop sidebar */}
      {!isMobile && (
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        />
      )}

      {/* Mobile sidebar — Sheet drawer */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
            <AppSidebar
              collapsed={false}
              onToggleCollapse={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Right side: topbar + page content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 w-full max-w-6xl mx-auto animate-fade-in">
          {children}
        </main>

        {/* FAB */}
        <Link
          href="/expenses?add=true"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50
                     w-14 h-14 rounded-full bg-primary text-primary-foreground
                     flex items-center justify-center shadow-lg
                     hover:scale-105 active:scale-95 transition-transform"
          aria-label="Add expense"
        >
          <Plus size={24} />
        </Link>

        {/* Bottom nav — mobile only */}
        {isMobile && <MobileNav />}
      </div>
    </div>
  )
}

//The main shell. On mobile: Sheet drawer for sidebar, bottom nav visible, FAB sits above bottom nav (bottom-20). On desktop: persistent sidebar, no bottom nav, FAB at bottom-6. pb-24 on mobile main prevents content hiding behind bottom nav.